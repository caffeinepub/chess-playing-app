import { useParams, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Settings, ArrowLeft } from 'lucide-react';
import { useGetSelfProfile, useGetProfileById, useCountFollowers, useCountFollowing } from '../hooks/useQueries';
import { useState } from 'react';
import EditProfileDialog from '../components/profile/EditProfileDialog';

export default function ProfilePage() {
  const params = useParams({ strict: false });
  const navigate = useNavigate();
  const profileId = (params as any).profileId;

  const [showEditDialog, setShowEditDialog] = useState(false);

  const { data: selfProfile, isLoading: selfLoading } = useGetSelfProfile();
  const { data: otherProfile, isLoading: otherLoading } = useGetProfileById(profileId);

  const isOwnProfile = !profileId;
  const profile = isOwnProfile ? selfProfile : otherProfile;
  const isLoading = isOwnProfile ? selfLoading : otherLoading;

  const userId = profile?.author.toString();
  const { data: followersCount } = useCountFollowers(userId);
  const { data: followingCount } = useCountFollowing(userId);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-destructive">Profile not found</p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Feed</Button>
      </div>
    );
  }

  const avatarUrl = profile.image.getDirectURL();

  return (
    <div className="space-y-6">
      {!isOwnProfile && (
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: '/' })}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-2xl">{profile.displayName[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 space-y-4">
              <div>
                <h2 className="text-2xl font-bold">{profile.displayName}</h2>
                {profile.bio && <p className="text-muted-foreground mt-2">{profile.bio}</p>}
              </div>

              <div className="flex gap-6 text-sm">
                <div>
                  <span className="font-semibold">0</span> posts
                </div>
                <div>
                  <span className="font-semibold">{followersCount?.toString() || '0'}</span> followers
                </div>
                <div>
                  <span className="font-semibold">{followingCount?.toString() || '0'}</span> following
                </div>
              </div>

              {isOwnProfile && (
                <Button variant="outline" size="sm" onClick={() => setShowEditDialog(true)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>No posts yet</p>
          </div>
        </CardContent>
      </Card>

      {isOwnProfile && (
        <EditProfileDialog
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          profile={profile}
        />
      )}
    </div>
  );
}
