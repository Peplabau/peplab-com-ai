import { useEffect, useState, type FormEvent } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Check, Copy, Loader2, X } from 'lucide-react';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { sendSignUpWelcome } from '@/lib/email';
import { signUp, supabase } from '@/lib/supabase';
import {
  dismissSignupWelcome,
  getSignupWelcomeDelayMs,
  hasDismissedSignupWelcome,
  isSignupWelcomeEnabled,
  isSignupWelcomeExcludedPath,
  SIGNUP_WELCOME_PROMO_CODE,
  stashSignupWelcomePromoCode,
  whenPageVisible,
} from '@/lib/signup-welcome';
import { cn } from '@/lib/utils';

const FEATURE_BULLETS = [
  'EVERY BATCH TESTED',
  'SAME-DAY DISPATCH',
  '≥99% PURITY',
] as const;

type Step = 'form' | 'success';

function displayNameFromEmail(email: string): string {
  const local = email.split('@')[0]?.trim() || 'there';
  const cleaned = local.replace(/[._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return 'there';
  return cleaned
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

/** Strong one-time password — user is signed in immediately; they can reset later. */
function generateTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = new Uint8Array(20);
  crypto.getRandomValues(bytes);
  let out = '';
  for (let i = 0; i < bytes.length; i += 1) {
    out += alphabet[bytes[i]! % alphabet.length];
  }
  return out;
}

function isAlreadyRegisteredError(message: string | undefined | null): boolean {
  const m = (message || '').toLowerCase();
  return (
    m.includes('already registered') ||
    m.includes('already been registered') ||
    m.includes('user already exists') ||
    m.includes('email address is already')
  );
}

export default function SignupWelcomeModal() {
  const enabled = isSignupWelcomeEnabled();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const [alreadyHadAccount, setAlreadyHadAccount] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelVisibleWait: (() => void) | undefined;

    const scheduleShow = () => {
      cancelVisibleWait = whenPageVisible(() => {
        if (cancelled) return;
        const delay = getSignupWelcomeDelayMs(location.pathname);
        timer = window.setTimeout(() => {
          if (!cancelled) setOpen(true);
        }, delay);
      });
    };

    const evaluate = async () => {
      if (isSignupWelcomeExcludedPath(location.pathname)) return;
      if (hasDismissedSignupWelcome()) return;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (cancelled) return;
        if (session?.user) {
          dismissSignupWelcome();
          return;
        }
      } catch {
        /* still show for logged-out visitors */
      }

      scheduleShow();
    };

    void evaluate();

    return () => {
      cancelled = true;
      cancelVisibleWait?.();
      if (timer) window.clearTimeout(timer);
    };
  }, [enabled, location.pathname]);

  if (!enabled) return null;

  const handleClose = () => {
    dismissSignupWelcome();
    setOpen(false);
    setStep('form');
    setCopied(false);
    setIsSubmitting(false);
    setAccountCreated(false);
    setAlreadyHadAccount(false);
  };

  const finishWithCode = (opts: { created: boolean; existing: boolean }) => {
    stashSignupWelcomePromoCode(SIGNUP_WELCOME_PROMO_CODE);
    dismissSignupWelcome();
    setAccountCreated(opts.created);
    setAlreadyHadAccount(opts.existing);
    setStep('success');
    setIsSubmitting(false);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setEmailError('Enter a valid email address.');
      return;
    }

    setEmailError(null);
    setIsSubmitting(true);
    setEmail(trimmed);

    const name = displayNameFromEmail(trimmed);
    const password = generateTempPassword();

    try {
      const { data: signUpResult, error: signUpError } = await signUp(trimmed, password, { name });

      if (signUpError) {
        if (isAlreadyRegisteredError(signUpError.message)) {
          finishWithCode({ created: false, existing: true });
          return;
        }
        setEmailError(signUpError.message || 'Could not create your account. Please try again.');
        setIsSubmitting(false);
        return;
      }

      void sendSignUpWelcome(trimmed, name).catch(() => {
        /* non-blocking */
      });

      // Let them set a lasting password via email link.
      void supabase.auth
        .resetPasswordForEmail(trimmed, {
          redirectTo: `${window.location.origin}/reset-password`,
        })
        .catch(() => {
          /* non-blocking */
        });

      if (signUpResult?.session) {
        localStorage.setItem('peplab_logged_in', 'true');
        localStorage.removeItem('peplab_is_admin');
      }

      finishWithCode({ created: true, existing: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setEmailError(msg);
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(SIGNUP_WELCOME_PROMO_CODE);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) handleClose();
        else setOpen(true);
      }}
    >
      <DialogContent
        showCloseButton={false}
        overlayClassName="bg-black/65 !z-[10100]"
        className={cn(
          'gap-0 overflow-hidden border border-[rgba(244,246,250,0.14)] bg-[#070A12] p-0 outline-none ring-0',
          'w-[min(100vw-1.5rem,420px)] max-w-[420px] rounded-[1.25rem]',
          'shadow-[0_24px_64px_rgba(0,0,0,0.5)]',
          '!z-[10101]',
        )}
      >
        <DialogTitle className="sr-only">
          {step === 'success' ? 'Thanks for signing up' : 'Welcome to PEPLAB'}
        </DialogTitle>
        <DialogDescription className="sr-only">
          {step === 'success'
            ? `Your discount code is ${SIGNUP_WELCOME_PROMO_CODE}.`
            : 'Get 10% off your first order and earn rewards on every purchase. Enter your email to claim your discount.'}
        </DialogDescription>

        <DialogClose
          onClick={handleClose}
          className="absolute right-3.5 top-3.5 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(139,92,246,0.4)] bg-[#070A12] text-[#A9B3C7] transition-all hover:border-[rgba(44,243,87,0.55)] hover:text-[#F4F6FA] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#2CF357]"
          aria-label="Close"
        >
          <X size={16} strokeWidth={2.25} />
        </DialogClose>

        {step === 'success' ? (
          <div className="relative z-10 px-6 py-12 sm:px-8 sm:py-14">
            <div className="text-center">
              <p className="text-[1.15rem] font-extrabold uppercase tracking-[0.04em] text-[#F4F6FA] sm:text-[1.25rem]">
                Thanks for signing up!
              </p>
              <p className="mt-4 text-[1.35rem] font-extrabold uppercase tracking-[0.06em] text-[#F4F6FA] sm:text-[1.5rem]">
                Code:{' '}
                <span className="text-[#2CF357]">{SIGNUP_WELCOME_PROMO_CODE}</span>
              </p>
              <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#A9B3C7]">
                10% off your first order · Applied at checkout
              </p>
              {accountCreated && (
                <p className="mt-4 text-[12px] leading-relaxed text-[#A9B3C7]">
                  Your account is ready and you&apos;re signed in. We sent a link to set your password.
                </p>
              )}
              {alreadyHadAccount && (
                <p className="mt-4 text-[12px] leading-relaxed text-[#A9B3C7]">
                  This email already has an account. Use your code at checkout, or{' '}
                  <button
                    type="button"
                    className="font-semibold text-[#2CF357] underline-offset-2 hover:underline"
                    onClick={() => {
                      handleClose();
                      navigate(`/login?email=${encodeURIComponent(email.trim())}`);
                    }}
                  >
                    sign in
                  </button>
                  .
                </p>
              )}

              <button
                type="button"
                onClick={() => void handleCopyCode()}
                className="mt-7 inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[rgba(44,243,87,0.42)] bg-[#0B1220] px-5 text-xs font-bold uppercase tracking-[0.14em] text-[#F4F6FA] transition-all hover:border-[rgba(44,243,87,0.62)] hover:bg-[rgba(44,243,87,0.12)]"
              >
                {copied ? <Check size={15} className="text-[#2CF357]" /> : <Copy size={15} />}
                {copied ? 'Copied' : 'Copy code'}
              </button>

              <div className="mt-5 flex flex-col gap-2">
                {accountCreated && (
                  <button
                    type="button"
                    onClick={() => {
                      handleClose();
                      navigate('/dashboard');
                    }}
                    className="flex h-11 w-full items-center justify-center rounded-xl border border-[rgba(44,243,87,0.42)] bg-[rgba(44,243,87,0.12)] text-xs font-bold uppercase tracking-[0.14em] text-[#F4F6FA] transition-all hover:bg-[rgba(44,243,87,0.2)]"
                  >
                    Go to dashboard
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex min-h-[38px] w-full items-center justify-center text-sm font-medium text-[#6B7280] transition-colors hover:text-[#A9B3C7]"
                >
                  Continue shopping
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative z-10 max-h-[min(90vh,680px)] overflow-y-auto px-6 pb-6 pt-7 sm:px-7 sm:pb-7 sm:pt-8">
            <div className="mb-7 flex items-start justify-between gap-4 pr-8">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#A9B3C7]">
                  Welcome to
                </p>
                <span className="block text-[1.85rem] font-bold tracking-[0.12em] gradient-text leading-none sm:text-[2rem]">
                  PEPLAB
                </span>
              </div>

              <div className="shrink-0 pt-0.5 text-right">
                <div className="mb-3">
                  <p className="text-[2.15rem] font-extrabold leading-none tracking-[-0.04em] text-[#F4F6FA]">
                    10<span className="text-[#2CF357]">%</span>
                  </p>
                  <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A9B3C7]">
                    Off first order
                  </p>
                </div>
                <div>
                  <p className="text-[1.85rem] font-extrabold leading-none tracking-[-0.04em] text-[#F4F6FA]">
                    +5<span className="text-[#2CF357]">%</span>
                  </p>
                  <p className="mt-1 max-w-[8.5rem] text-[9px] font-semibold uppercase leading-snug tracking-[0.16em] text-[#A9B3C7]">
                    Credit on every order
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6 text-center">
              <h2 className="text-[1.05rem] font-extrabold uppercase leading-[1.2] tracking-[-0.015em] text-[#F4F6FA] sm:text-[1.15rem]">
                We handle the <span className="text-[#2CF357]">purity</span>.
                <br />
                You handle the <span className="text-[#2CF357]">discovery</span>.
              </h2>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-1 text-[9px] font-semibold uppercase tracking-[0.13em] text-[#A9B3C7]">
                {FEATURE_BULLETS.map((item, index) => (
                  <span key={item} className="inline-flex items-center gap-2.5">
                    {index > 0 && (
                      <span className="text-[#2CF357]" aria-hidden>
                        •
                      </span>
                    )}
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="mb-5 h-px bg-[rgba(244,246,250,0.08)]" aria-hidden />

            <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
              <div>
                <label
                  htmlFor="welcome-email"
                  className="mb-2 block text-[9px] font-semibold uppercase tracking-[0.18em] text-[#A9B3C7]"
                >
                  Email address
                </label>
                <input
                  id="welcome-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError(null);
                  }}
                  placeholder="you@lab.edu"
                  autoComplete="email"
                  disabled={isSubmitting}
                  className="h-11 w-full rounded-lg border border-[rgba(244,246,250,0.12)] bg-[#111827] px-3.5 text-sm text-[#F4F6FA] placeholder:text-[#6B7280] outline-none transition-colors focus:border-[rgba(44,243,87,0.5)] focus:ring-2 focus:ring-[rgba(44,243,87,0.16)] disabled:opacity-60"
                />
                {emailError && (
                  <p className="mt-2 text-xs text-[#F87171]">{emailError}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-[rgba(44,243,87,0.42)] bg-[#0B1220] text-xs font-bold uppercase tracking-[0.14em] text-[#F4F6FA] transition-all hover:border-[rgba(44,243,87,0.62)] hover:bg-[rgba(44,243,87,0.12)] hover:shadow-[0_16px_48px_-20px_rgba(44,243,87,0.45)] active:translate-y-0.5 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    Creating account…
                  </>
                ) : (
                  'Get my discount'
                )}
              </button>
            </form>

            <p className="mt-4 text-center text-[9px] font-medium uppercase tracking-[0.11em] text-[#6B7280]">
              Creates your account · Applied automatically · No spam
            </p>

            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="mt-4 flex min-h-[38px] w-full items-center justify-center text-sm font-medium text-[#6B7280] transition-colors hover:text-[#A9B3C7] disabled:opacity-50"
            >
              Maybe later
            </button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
