import Map "mo:core/Map";
import List "mo:core/List";
import Nat32 "mo:core/Nat32";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  type SocialProfile = {
    id : Text;
    image : ExternalBlob;
    displayName : Text;
    bio : Text;
    author : Principal;
    timestamp : Time.Time;
  };

  type Post = {
    id : Text;
    image : ExternalBlob;
    caption : Text;
    author : Principal;
    timestamp : Time.Time;
    likes : Nat;
    authorUsername : Text;
  };

  type Comment = {
    id : Text;
    postId : Text;
    author : Principal;
    authorUsername : Text;
    content : Text;
    timestamp : Time.Time;
  };

  type Follow = {
    follower : Principal;
    followee : Principal;
  };

  module Profile {
    public func compareByTimestamp(p1 : SocialProfile, p2 : SocialProfile) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };

    public func compareById(p1 : SocialProfile, p2 : SocialProfile) : Order.Order {
      Text.compare(p1.id, p2.id);
    };
  };

  module Post {
    public func compareByTimestamp(p1 : Post, p2 : Post) : Order.Order {
      Int.compare(p2.timestamp, p1.timestamp);
    };

    public func compareByLikes(p1 : Post, p2 : Post) : Order.Order {
      Nat.compare(p2.likes, p1.likes);
    };
  };

  module Comment {
    public func compareByTimestamp(c1 : Comment, c2 : Comment) : Order.Order {
      Int.compare(c2.timestamp, c1.timestamp);
    };
  };

  module Follow {
    public func compareByFollower(f1 : Follow, f2 : Follow) : Order.Order {
      Principal.compare(f1.follower, f2.follower);
    };
  };

  include MixinStorage();

  // Authorization setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Persistent store mappings
  let profileStore = Map.empty<Nat32, SocialProfile>();
  let postStore = Map.empty<Nat32, Post>();
  let commentStore = Map.empty<Nat32, Comment>();
  let followStore = Map.empty<Nat32, Follow>();

  // Counter stores to track ID generation
  var profileCounter : Nat = 0;
  var postCounter : Nat = 0;
  var commentCounter : Nat = 0;
  var followCounter : Nat = 0;

  // Secure ID generation
  func generateId(prefix : Text, counter : Nat) : Text {
    prefix # (counter + 1).toText();
  };

  // User Profile Management (required by frontend)
  public type UserProfile = {
    displayName : Text;
    bio : Text;
    image : ExternalBlob;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    switch (profileStore.values().find(func(p) { Principal.equal(p.author, caller) })) {
      case (null) { null };
      case (?profile) {
        ?{
          displayName = profile.displayName;
          bio = profile.bio;
          image = profile.image;
        };
      };
    };
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    switch (profileStore.values().find(func(p) { Principal.equal(p.author, user) })) {
      case (null) { null };
      case (?profile) {
        ?{
          displayName = profile.displayName;
          bio = profile.bio;
          image = profile.image;
        };
      };
    };
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    // Check if profile exists
    let existingProfileOpt = profileStore.values().find(func(p) { Principal.equal(p.author, caller) });

    switch (existingProfileOpt) {
      case (null) {
        // Create new profile
        let profileIdText = generateId("profile_", profileCounter);
        let newProfile : SocialProfile = {
          id = profileIdText;
          image = profile.image;
          displayName = profile.displayName;
          bio = profile.bio;
          author = caller;
          timestamp = Time.now();
        };
        profileStore.add(Nat32.fromNat(profileCounter), newProfile);
        profileCounter += 1;
      };
      case (?existingProfile) {
        // Update existing profile
        let updatedProfile : SocialProfile = {
          existingProfile with
          displayName = profile.displayName;
          bio = profile.bio;
          image = profile.image;
          timestamp = Time.now();
        };

        // Store transformation
        let profileEntries = profileStore.entries().toArray();
        for ((id, p) in profileEntries.values()) {
          if (Principal.equal(p.author, caller)) {
            profileStore.add(id, updatedProfile);
          };
        };
      };
    };
  };

  // Following relationships
  public shared ({ caller }) func toggleFollow(target : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can follow others");
    };

    if (Principal.equal(target, caller)) {
      Runtime.trap("Cannot follow yourself!");
    };

    var followingIndex : ?Nat32 = null;
    let followArray = followStore.entries().toArray();
    for ((id, follow) in followArray.values()) {
      if (Principal.equal(follow.follower, caller) and Principal.equal(follow.followee, target)) {
        followingIndex := ?id;
      };
    };

    switch (followingIndex) {
      case (?id) {
        followStore.remove(id);
      };
      case (null) {
        let newFollow : Follow = {
          follower = caller;
          followee = target;
        };
        followStore.add(Nat32.fromNat(followCounter), newFollow);
        followCounter += 1;
      };
    };
  };

  // Counts
  public query ({ caller }) func countFollowers(user : Principal) : async Nat {
    var count = 0;
    for (follow in followStore.values()) {
      if (Principal.equal(follow.followee, user)) {
        count += 1;
      };
    };
    count;
  };

  public query ({ caller }) func countFollowing(user : Principal) : async Nat {
    var count = 0;
    for (follow in followStore.values()) {
      if (Principal.equal(follow.follower, user)) {
        count += 1;
      };
    };
    count;
  };

  // Profile Management
  public shared ({ caller }) func createProfile(displayName : Text, bio : Text, image : ExternalBlob) : async SocialProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create profiles");
    };

    if (displayName.size() == 0) {
      Runtime.trap("Display name cannot be empty!");
    };
    let profileIdText = generateId("profile_", profileCounter);

    let newProfile : SocialProfile = {
      id = profileIdText;
      image;
      displayName;
      bio;
      author = caller;
      timestamp = Time.now();
    };

    profileStore.add(Nat32.fromNat(profileCounter), newProfile);
    profileCounter += 1;

    newProfile;
  };

  public query ({ caller }) func getProfileById(id : Text) : async SocialProfile {
    switch (profileStore.values().find(func(p) { p.id == id })) {
      case (null) {
        Runtime.trap("Profile not found with id " # id);
      };
      case (?profile) { profile };
    };
  };

  public query ({ caller }) func getSelfProfile() : async SocialProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access their profile");
    };

    switch (profileStore.values().find(func(p) { Principal.equal(p.author, caller) })) {
      case (null) {
        Runtime.trap("Profile not found for this user");
      };
      case (?profile) { profile };
    };
  };

  public shared ({ caller }) func updateProfile(displayName : Text, bio : Text, image : ExternalBlob) : async SocialProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update profiles");
    };

    let currentProfileOpt = profileStore.values().find(func(profile) { Principal.equal(profile.author, caller) });

    let currentProfile = switch (currentProfileOpt) {
      case (null) { Runtime.trap("Profile does not exist. Please create one first.") };
      case (?profile) { profile };
    };

    let updatedProfile : SocialProfile = {
      currentProfile with
      displayName;
      bio;
      image;
      timestamp = Time.now();
    };

    // Store transformation
    let profileEntries = profileStore.entries().toArray();
    for ((id, profile) in profileEntries.values()) {
      if (Principal.equal(profile.author, caller)) {
        profileStore.add(id, updatedProfile);
      };
    };
    updatedProfile;
  };

  public query ({ caller }) func listProfiles(search : ?Text) : async [SocialProfile] {
    var filteredList : [SocialProfile] = [];
    switch (search) {
      case (null) {
        filteredList := profileStore.values().toArray();
      };
      case (?term) {
        filteredList := profileStore.values().toArray().filter(
          func(p) { p.displayName.contains(#text term) }
        );
      };
    };
    filteredList.sort(Profile.compareByTimestamp);
  };

  // Posts
  public shared ({ caller }) func createPost(caption : Text, image : ExternalBlob) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create posts");
    };

    let userProfileOpt = profileStore.values().find(func(profile) { Principal.equal(profile.author, caller) });

    let userProfile = switch (userProfileOpt) {
      case (null) { Runtime.trap("User profile not found. Cannot create post.") };
      case (?profile) { profile };
    };

    if (caption.size() == 0) {
      Runtime.trap("Post must have a caption!");
    };

    let postIdText = generateId("post_", postCounter);
    let newPost : Post = {
      id = postIdText;
      image;
      caption;
      author = caller;
      authorUsername = userProfile.displayName;
      timestamp = Time.now();
      likes = 0;
    };

    postStore.add(Nat32.fromNat(postCounter), newPost);
    postCounter += 1;

    newPost;
  };

  public query ({ caller }) func getPostById(postId : Text) : async Post {
    switch (postStore.values().find(func(p) { p.id == postId })) {
      case (null) {
        Runtime.trap("Post not found with id " # postId);
      };
      case (?post) { post };
    };
  };

  public shared ({ caller }) func toggleLike(postId : Text) : async Post {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can like posts");
    };

    // Store transformation
    let postEntries = postStore.entries().toArray();
    for ((id, post) in postEntries.values()) {
      if (post.id == postId) {
        let updatedPost : Post = {
          post with likes = post.likes + 1;
        };
        postStore.add(id, updatedPost);
        return updatedPost;
      };
    };
    Runtime.trap("Post with " # postId # " does not exist.");
  };

  public shared ({ caller }) func deletePost(postId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete posts");
    };

    // Store transformation
    let postEntries = postStore.entries().toArray();
    var found = false;
    for ((id, post) in postEntries.values()) {
      if (post.id == postId) {
        // Only the author can delete their own post
        if (not Principal.equal(post.author, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the post author can delete this post");
        };
        postStore.remove(id);
        found := true;
      };
    };

    if (not found) {
      Runtime.trap("Post not found");
    };
  };

  public query ({ caller }) func getFeed(postsPerPage : Nat, page : Nat) : async [Post] {
    let feedArray = postStore.values().toArray().sort(Post.compareByTimestamp);
    let start = postsPerPage * page;
    let end = Int.min(feedArray.size(), postsPerPage * (page + 1));
    if (start >= feedArray.size()) {
      return [];
    };
    Array.tabulate<Post>(end.toNat() - start, func(i) { feedArray[start + i] });
  };

  // Comments
  public shared ({ caller }) func createComment(postId : Text, content : Text, authorUsername : Text) : async Comment {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create comments");
    };

    switch (postStore.values().find(func(p) { p.id == postId })) {
      case (null) {
        Runtime.trap("Cannot comment on non-existent post");
      };
      case (?_) {
        let commentIdText = generateId("comment_", commentCounter);
        let newComment : Comment = {
          id = commentIdText;
          postId;
          author = caller;
          authorUsername;
          content;
          timestamp = Time.now();
        };
        commentStore.add(Nat32.fromNat(commentCounter), newComment);
        commentCounter += 1;
        newComment;
      };
    };
  };

  public query ({ caller }) func getCommentsByPostId(postId : Text) : async [Comment] {
    let commentValues = commentStore.values().toArray();
    let filtered = commentValues.filter(
      func(comment) { comment.postId == postId }
    );
    filtered.sort(Comment.compareByTimestamp);
  };

  public shared ({ caller }) func deleteComment(commentId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete comments");
    };

    // Store transformation
    let commentEntries = commentStore.entries().toArray();
    var found = false;
    for ((id, comment) in commentEntries.values()) {
      if (comment.id == commentId) {
        // Only the author can delete their own comment
        if (not Principal.equal(comment.author, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the comment author can delete this comment");
        };
        commentStore.remove(id);
        found := true;
      };
    };

    if (not found) {
      Runtime.trap("Comment does not exist with id " # commentId);
    };
  };
};
