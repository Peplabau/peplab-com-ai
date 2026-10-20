import { useEffect } from 'react';

type ExternalRedirectProps = {
  to: string;
};

/** Hard navigate to an absolute URL (used for .com.au → peplab.ai landings). */
export default function ExternalRedirect({ to }: ExternalRedirectProps) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="min-h-[40vh] flex items-center justify-center" style={{ background: '#070A12' }}>
      <div className="w-8 h-8 border-2 border-[#2ED1B4] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
