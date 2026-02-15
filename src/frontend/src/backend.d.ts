import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export type Time = bigint;
export interface Comment {
    id: string;
    authorUsername: string;
    content: string;
    author: Principal;
    timestamp: Time;
    postId: string;
}
export interface Post {
    id: string;
    authorUsername: string;
    author: Principal;
    likes: bigint;
    timestamp: Time;
    caption: string;
    image: ExternalBlob;
}
export interface SocialProfile {
    id: string;
    bio: string;
    displayName: string;
    author: Principal;
    timestamp: Time;
    image: ExternalBlob;
}
export interface UserProfile {
    bio: string;
    displayName: string;
    image: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    countFollowers(user: Principal): Promise<bigint>;
    countFollowing(user: Principal): Promise<bigint>;
    createComment(postId: string, content: string, authorUsername: string): Promise<Comment>;
    createPost(caption: string, image: ExternalBlob): Promise<Post>;
    createProfile(displayName: string, bio: string, image: ExternalBlob): Promise<SocialProfile>;
    deleteComment(commentId: string): Promise<void>;
    deletePost(postId: string): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCommentsByPostId(postId: string): Promise<Array<Comment>>;
    getFeed(postsPerPage: bigint, page: bigint): Promise<Array<Post>>;
    getPostById(postId: string): Promise<Post>;
    getProfileById(id: string): Promise<SocialProfile>;
    getSelfProfile(): Promise<SocialProfile>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listProfiles(search: string | null): Promise<Array<SocialProfile>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleFollow(target: Principal): Promise<void>;
    toggleLike(postId: string): Promise<Post>;
    updateProfile(displayName: string, bio: string, image: ExternalBlob): Promise<SocialProfile>;
}
