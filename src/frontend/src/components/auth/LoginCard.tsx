import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../../hooks/useAuth';

export default function LoginCard() {
  const { login, loginStatus } = useAuth();
  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <img
              src="/assets/generated/logo.dim_512x512.png"
              alt="Logo"
              className="h-24 w-24 object-contain"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Welcome to Snaply</CardTitle>
          <CardDescription className="text-base">
            Share moments, connect with friends, and explore the world through photos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-12 text-lg font-semibold"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                Signing in...
              </>
            ) : (
              'Sign in to get started'
            )}
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
