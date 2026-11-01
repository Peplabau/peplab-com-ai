import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShoppingBag,
  User,
} from 'lucide-react';
import Navigation from '@/components/Navigation';
import CartDrawer from '@/components/CartDrawer';
import ShopPromoStrip, { HalloweenPumpkinIcon } from '@/components/ShopPromoStrip';
import ResearchMarquee from '@/components/ResearchMarquee';
import { SEO } from '@/components/SEO';
import { SITE_SEO_DESCRIPTION, SITE_SEO_KEYWORDS, SITE_SEO_TITLE } from '@/lib/seo-keywords';
import { checkIsAdmin } from '@/lib/supabase-db';
import { getCurrentUser, signIn, signUp, supabase } from '@/lib/supabase';
import { sendSignUpWelcome } from '@/lib/email';
import { handoffToExternalShop, resolvePostLoginPath } from '@/lib/login-redirect';
import { EXTERNAL_SHOP_ORIGIN, externalShopUrl } from '@/lib/domain';
import {
  DEFAULT_RESEARCH_DISCLAIMER_SETTINGS,
  getSiteSetting,
} from '@/lib/settings';

/** Shop CTA → peplab.ai root (not /shop). */
const SHOP_EXTERNAL_URL = externalShopUrl('/');

const VERIFICATION_PENDING_COPY =
  "Your account is created. We've also sent a quick confirmation email — open it to finish setting up your dashboard access.";

function friendlyAuthErrorMessage(raw: string | undefined | null): string {
  const m = (raw || '').trim();
  if (/email\s+not\s+confirmed/i.test(m)) return VERIFICATION_PENDING_COPY;
  if (/invalid\s+login\s+credentials/i.test(m)) {
    return "That email and password don't match an account. Double-check your details, or create a new account.";
  }
  if (/user\s+already\s+registered/i.test(m)) {
    return 'An account with this email already exists. Try signing in instead.';
  }
  return m || 'Something went wrong. Please try again.';
}

type AuthMode = 'signin' | 'signup';

type HomeLandingProps = {
  /**
   * Render only the lock slot (Shop CTA + sign-in card) so it can replace the
   * catalog inside ShopHome. Navigation, SEO, and the sections below stay on
   * the parent page.
   */
  embedded?: boolean;
};

export default function HomeLanding({ embedded = false }: HomeLandingProps) {
  const [searchParams] = useSearchParams();
  const [authMode, setAuthMode] = useState<AuthMode>(() => {
    const mode = searchParams.get('signup') ?? searchParams.get('mode');
    return mode === '1' || mode === 'true' || mode === 'signup' ? 'signup' : 'signin';
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [sessionReady, setSessionReady] = useState(false);
  const [isHandingOff, setIsHandingOff] = useState(false);
  const [researchDisclaimer, setResearchDisclaimer] = useState(
    DEFAULT_RESEARCH_DISCLAIMER_SETTINGS.message,
  );
  const handoffStarted = useRef(false);

  const redirectAfterLogin = useCallback(async () => {
    if (handoffStarted.current) return;
    handoffStarted.current = true;
    setIsHandingOff(true);
    setIsSubmitting(true);
    setError(null);
    try {
      const destination = await resolvePostLoginPath(searchParams.get('redirect') ?? '/');
      await handoffToExternalShop(destination);
    } catch {
      handoffStarted.current = false;
      setIsHandingOff(false);
      setIsSubmitting(false);
      setError('Could not open the shop. Please try again.');
    }
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    getSiteSetting('research_disclaimer_settings', DEFAULT_RESEARCH_DISCLAIMER_SETTINGS)
      .then((settings) => {
        if (cancelled) return;
        setResearchDisclaimer(
          settings.message?.trim() || DEFAULT_RESEARCH_DISCLAIMER_SETTINGS.message,
        );
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const user = await getCurrentUser();
      if (cancelled) return;
      if (user) {
        localStorage.setItem('peplab_logged_in', 'true');
        setSessionReady(true);
        await redirectAfterLogin();
        return;
      }
      localStorage.removeItem('peplab_logged_in');
      setSessionReady(true);
    })();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        localStorage.setItem('peplab_logged_in', 'true');
        void redirectAfterLogin();
      } else {
        localStorage.removeItem('peplab_logged_in');
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [redirectAfterLogin]);

  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (!emailParam) return;
    setFormData((prev) => ({ ...prev, email: decodeURIComponent(emailParam) }));
  }, [searchParams]);

  const markLoggedIn = async (userId?: string) => {
    localStorage.setItem('peplab_logged_in', 'true');
    if (userId && (await checkIsAdmin(userId))) {
      localStorage.setItem('peplab_is_admin', 'true');
    } else {
      localStorage.removeItem('peplab_is_admin');
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setMagicLinkSent(false);

    try {
      if (authMode === 'signup') {
        const { data, error: signUpError } = await signUp(formData.email, formData.password, {
          name: formData.name,
        });
        if (signUpError) {
          setError(friendlyAuthErrorMessage(signUpError.message));
          setIsSubmitting(false);
          return;
        }
        void sendSignUpWelcome(formData.email, formData.name).catch(() => {});
        if (data?.session?.user) {
          await markLoggedIn(data.session.user.id);
          await redirectAfterLogin();
          return;
        }
        const { error: signInError } = await signIn(formData.email, formData.password);
        if (signInError) {
          setError(VERIFICATION_PENDING_COPY);
          setIsSubmitting(false);
          return;
        }
        const user = await getCurrentUser();
        await markLoggedIn(user?.id);
        await redirectAfterLogin();
        return;
      }

      const { error: signInError } = await signIn(formData.email, formData.password);
      if (signInError) {
        setError(friendlyAuthErrorMessage(signInError.message));
        setIsSubmitting(false);
        return;
      }
      const user = await getCurrentUser();
      await markLoggedIn(user?.id);
      await redirectAfterLogin();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(friendlyAuthErrorMessage(msg));
      setIsSubmitting(false);
    }
  };

  const handleMagicLink = async () => {
    const email = formData.email.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter your email address first, then request a sign-in link.');
      return;
    }
    setIsSubmitting(true);
    setError(null);
    setMagicLinkSent(false);
    try {
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${EXTERNAL_SHOP_ORIGIN}/dashboard`,
          shouldCreateUser: true,
        },
      });
      if (otpError) {
        setError(friendlyAuthErrorMessage(otpError.message));
        setIsSubmitting(false);
        return;
      }
      setMagicLinkSent(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Could not send sign-in link.';
      setError(friendlyAuthErrorMessage(msg));
    } finally {
      setIsSubmitting(false);
    }
  };

  const lockSlot = (
    <div className="px-4 sm:px-6 lg:px-12">
      <ShopPromoStrip />

      {researchDisclaimer.trim() ? (
        <ResearchMarquee
          text={researchDisclaimer}
          className="mb-4 sm:mb-6 rounded-lg border border-[rgba(239,68,68,0.2)] bg-[#1e1019] py-2"
        />
      ) : null}

      {/* Wide panel — same animated Halloween treatment as the promo strip. */}
      <div className="catalog-halloween-strip relative overflow-hidden rounded-2xl border border-[rgba(139,92,246,0.4)] bg-[#0c0a14] px-4 py-8 shadow-[0_0_24px_rgba(139,92,246,0.18)] sm:px-8 sm:py-10 lg:px-12 lg:py-12">
        <div className="catalog-halloween-pumpkin" aria-hidden="true">
          <HalloweenPumpkinIcon className="h-full w-full" />
        </div>
        <div className="catalog-halloween-web" aria-hidden="true" />
        <div className="catalog-halloween-jacks" aria-hidden="true">
          <span className="catalog-halloween-jack catalog-halloween-jack--a">
            <HalloweenPumpkinIcon className="h-full w-full" />
          </span>
          <span className="catalog-halloween-jack catalog-halloween-jack--b">
            <HalloweenPumpkinIcon className="h-full w-full" />
          </span>
        </div>
        <div className="relative z-10 mx-auto w-full max-w-xl">
              {!isHandingOff ? (
                <a
                  href={SHOP_EXTERNAL_URL}
                  rel="nofollow noopener noreferrer"
                  className="mb-6 flex w-full items-center justify-center gap-2 rounded-xl border border-[rgba(139,92,246,0.45)] bg-[rgba(139,92,246,0.12)] px-4 py-3 text-sm font-semibold text-[#F4F6FA] transition-colors hover:bg-[rgba(139,92,246,0.2)]"
                >
                  <ShoppingBag className="h-4 w-4 text-[#F97316] shrink-0" />
                  Shop
                </a>
              ) : null}

              {!sessionReady || isHandingOff ? (
                <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
                  <div className="mb-4 h-9 w-9 animate-spin rounded-full border-2 border-[#2ED1B4] border-t-transparent" />
                  <p className="text-base font-medium text-[#F4F6FA]">
                    {isHandingOff ? 'Signing in…' : 'Loading…'}
                  </p>
                  <p className="mt-1.5 text-sm text-[#A9B3C7]">Please wait</p>
                </div>
              ) : (
                <div>
                  <h2 className="mb-1 text-center text-xl font-semibold text-[#F4F6FA] lg:text-2xl">Welcome back</h2>
                  <p className="mb-5 text-center text-sm text-[#A9B3C7]">
                    Sign in to continue.
                  </p>

                  <div className="mb-5 flex rounded-full bg-[rgba(7,10,18,0.65)] p-1 border border-[rgba(244,246,250,0.08)]">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signup');
                        setError(null);
                        setMagicLinkSent(false);
                      }}
                      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        authMode === 'signup'
                          ? 'bg-white text-[#070A12]'
                          : 'text-[#A9B3C7] hover:text-[#F4F6FA]'
                      }`}
                    >
                      Create account
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setError(null);
                        setMagicLinkSent(false);
                      }}
                      className={`flex-1 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        authMode === 'signin'
                          ? 'bg-white text-[#070A12]'
                          : 'text-[#A9B3C7] hover:text-[#F4F6FA]'
                      }`}
                    >
                      Sign in
                    </button>
                  </div>

                  {error && (
                    <div className="mb-4 rounded-xl border border-[rgba(239,68,68,0.2)] bg-[rgba(239,68,68,0.1)] p-3.5">
                      <p className="text-sm text-[#EF4444]">{error}</p>
                    </div>
                  )}
                  {magicLinkSent && (
                    <div className="mb-4 rounded-xl border border-[rgba(46,209,180,0.25)] bg-[rgba(46,209,180,0.1)] p-3.5">
                      <p className="text-sm text-[#2ED1B4]">
                        Check your inbox — we sent a sign-in link to {formData.email.trim()}.
                      </p>
                    </div>
                  )}

                  <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
                    {authMode === 'signup' && (
                      <div>
                        <label className="mb-1.5 block text-sm text-[#A9B3C7]">Full name</label>
                        <div className="relative">
                          <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            autoComplete="name"
                            className="w-full rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(7,10,18,0.55)] py-3 pl-10 pr-4 text-sm text-[#F4F6FA] placeholder-[#6B7280] outline-none transition-colors focus:border-[#2ED1B4]"
                            placeholder="Your name"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="mb-1.5 block text-sm text-[#A9B3C7]">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                          autoComplete="email"
                          className="w-full rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(7,10,18,0.55)] py-3 pl-10 pr-4 text-sm text-[#F4F6FA] placeholder-[#6B7280] outline-none transition-colors focus:border-[#2ED1B4]"
                          placeholder="you@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm text-[#A9B3C7]">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          required
                          minLength={8}
                          autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                          className="w-full rounded-xl border border-[rgba(244,246,250,0.1)] bg-[rgba(7,10,18,0.55)] py-3 pl-10 pr-11 text-sm text-[#F4F6FA] placeholder-[#6B7280] outline-none transition-colors focus:border-[#2ED1B4]"
                          placeholder="Your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#6B7280] transition-colors hover:text-[#F4F6FA]"
                          aria-label={showPassword ? 'Hide password' : 'Show password'}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2ED1B4] px-5 py-3 text-sm font-medium text-[#070A12] transition-colors hover:bg-[#26b89e] disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <>
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                          {authMode === 'signup' ? 'Creating account…' : 'Signing in…'}
                        </>
                      ) : (
                        <>
                          {authMode === 'signup' ? 'Create account' : 'Sign in'}
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-5 space-y-2 text-center">
                    <p className="text-xs text-[#A9B3C7]">
                      Forgot your password, or never set one?
                    </p>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => void handleMagicLink()}
                      className="text-sm font-medium text-[#2ED1B4] underline underline-offset-2 hover:text-[#5EEAD4] disabled:opacity-50"
                    >
                      Email me a sign-in link
                    </button>
                    <div>
                      <Link
                        to="/forgot-password"
                        className="text-xs text-[#6B7280] hover:text-[#A9B3C7] transition-colors"
                      >
                        Or reset password
                      </Link>
                    </div>
                  </div>
                </div>
              )}
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return (
      <section
        id="catalog"
        className="relative z-60 pt-16 sm:pt-20 lg:pt-24 pb-10"
      >
        {lockSlot}
      </section>
    );
  }

  return (
    <>
      <SEO
        title={SITE_SEO_TITLE}
        description={SITE_SEO_DESCRIPTION}
        keywords={SITE_SEO_KEYWORDS}
      />
      <div className="relative min-h-screen page-grid-bg flex flex-col">
        <Navigation />
        <CartDrawer />
        <main className="relative z-10 flex-1 pt-16 sm:pt-20 lg:pt-24 pb-10">
          {lockSlot}
        </main>
      </div>
    </>
  );
}
