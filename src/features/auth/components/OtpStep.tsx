import { ArrowLeft, Smartphone } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { Alert, Button, Field } from '@/shared/ui';
import { DUMMY_OTP } from '../data/dummyAccounts';

const OTP_LENGTH = 6;
const RESEND_AFTER_SECONDS = 30;

interface OtpStepProps {
  /** Null when the account has no mobile number on record. */
  mobile: string | null;
  onVerified: () => void;
  onBack: () => void;
}

/** "+91 ••••••2345": enough to recognise the number without showing it. */
const maskMobile = (mobile: string) => `+91 ••••••${mobile.slice(-4)}`;

/**
 * Second sign-in step. A dummy: no SMS is sent and the OTP is checked in the browser.
 * Replace with a server-side OTP check when an SMS gateway is connected.
 */
export function OtpStep({ mobile, onVerified, onBack }: OtpStepProps) {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [wait, setWait] = useState(RESEND_AFTER_SECONDS);

  useEffect(() => {
    if (wait === 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    setNotice(null);
    if (otp.length !== OTP_LENGTH) setError(`Enter the ${OTP_LENGTH}-digit OTP`);
    else if (otp !== DUMMY_OTP) setError('Incorrect OTP. Check the code and try again.');
    else onVerified();
  };

  const handleResend = () => {
    setOtp('');
    setError(null);
    setNotice('A new OTP is sent.');
    setWait(RESEND_AFTER_SECONDS);
  };

  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Verify your mobile number</h1>
      <p className="mt-1 mb-6 flex items-start gap-2 text-muted">
        <Smartphone aria-hidden className="mt-0.5 size-5 shrink-0" />
        <span>
          Enter the {OTP_LENGTH}-digit OTP sent to{' '}
          <span className="font-semibold text-ink">
            {mobile ? maskMobile(mobile) : 'your registered mobile number'}
          </span>
          .
        </span>
      </p>
      <form noValidate className="space-y-4" onSubmit={handleSubmit}>
        {notice && (
          <p role="status" className="text-sm text-success">
            {notice}
          </p>
        )}
        {error && <Alert>{error}</Alert>}
        <Field label="OTP" hint={`Demo: the OTP is always ${DUMMY_OTP}.`}>
          {(props) => (
            <input
              {...props}
              className={`${props.className} text-center text-lg tracking-[0.5em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={OTP_LENGTH}
              value={otp}
              onChange={(event) => {
                setOtp(event.target.value.replace(/\D/g, '').slice(0, OTP_LENGTH));
                setError(null);
              }}
            />
          )}
        </Field>
        <Button type="submit" className="w-full">
          Verify &amp; Sign in
        </Button>
      </form>
      <div className="mt-4 flex items-center justify-between text-sm">
        <button
          type="button"
          className="flex items-center gap-1 font-semibold text-muted hover:text-ink"
          onClick={onBack}
        >
          <ArrowLeft aria-hidden className="size-4" />
          Back
        </button>
        {wait > 0 ? (
          <span className="text-muted">Resend OTP in {wait}s</span>
        ) : (
          <button
            type="button"
            className="font-semibold text-blue-700 hover:underline"
            onClick={handleResend}
          >
            Resend OTP
          </button>
        )}
      </div>
    </>
  );
}
