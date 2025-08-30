import { ProfileSettings } from '@/components/profile/ProfileSettings';

export default function Profile() {
  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Profile Settings</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          Manage your account settings and preferences
        </p>
      </div>

      <ProfileSettings />
    </div>
  );
}