import React, { useState } from 'react';

const ThemeStyles = () => (
  <style>{`
    :root {
      color-scheme: light dark;
      --clerk-color-primary: light-dark(#163666, #B2D3DE);
      
      /* Note: Adjusted the dark mode foreground slightly to #163666 so the text is 
         readable on the light-blue dark mode primary button */
      --clerk-color-primary-foreground: light-dark(#EFF5F6, #163666);
      
      --clerk-color-danger: #E05047;
      --clerk-color-success: #71C9C5;
      --clerk-color-warning: #FACA78;
      --clerk-color-neutral: light-dark(#163666, #B2D3DE);
      --clerk-color-foreground: light-dark(#163666, #EFF5F6);
      --clerk-color-background: light-dark(#EFF5F6, #163666);
      --clerk-color-input: light-dark(#ffffff, #26262B);
      --clerk-color-input-foreground: light-dark(#163666, white);
      --clerk-color-ring: light-dark(color-mix(in srgb, #163666 15%), color-mix(in srgb, #fafafa 15%));
      --clerk-color-shimmer: #fafafa;
      --clerk-color-modal-backdrop: #163666;
      --clerk-border-radius: 0.175rem;
      --clerk-spacing: 1rem;
    }
    
    /* Using a neutral page background so the themed Clerk card stands out */
    body {
      background-color: #FAFAFA; 
      color: var(--clerk-color-foreground);
    }
    
    @import url('https://fonts.googleapis.com/css2?family=Khand:wght@600;700,&family=Roboto:wght@400;500;700&display=swap');
    .font-khand { font-family: 'Khand', sans-serif; }
    .x { font-family: 'Roboto', sans-serif; }

    @media (prefers-color-scheme: dark) {
      body {
        background-color: #0A0A0A;
      }
    }
  `}</style>
);



const ClerkFooter = ({ actionText, actionLink }) => (
  <div className="w-full flex flex-col">
    {/* Action Link Footer */}
    <div className="font-roboto font-medium px-8 py-4 border-t border-[var(--clerk-color-ring)] bg-black/[0.02] dark:bg-white/[0.02] flex justify-center items-center text-[13px] text-[var(--clerk-color-neutral)]">
      {actionText} <button className="text-[14px] font-khand uppercase tracking-wider font-bold ml-1 hover:opacity-80 pt-1 text-[var(--clerk-color-primary)] transition-opacity">{actionLink}</button>
    </div>
    
    {/* Secured By Footer */}
    <div className="px-8 py-3.5 border-t border-[var(--clerk-color-ring)] bg-black/[0.04] dark:bg-white/[0.04] flex justify-center items-center text-[12px] text-[var(--clerk-color-neutral)] opacity-80">
      Secured by 
      <div className="inline-flex items-center ml-1 font-bold text-[13px] tracking-tight">
        <svg className="w-3.5 h-3.5 mr-0.5 opacity-80" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
           <path d="M50 0C22.4 0 0 22.4 0 50s22.4 50 50 50 50-22.4 50-50S77.6 0 50 0zm0 73.5c-13 0-23.5-10.5-23.5-23.5S37 26.5 50 26.5 73.5 37 73.5 50 63 73.5 50 73.5z"/>
           <circle cx="50" cy="50" r="12" />
        </svg>
        clerk
      </div>
    </div>
  </div>
);

const WaitlistComponent = () => (
  <div className="w-full flex flex-col animate-in fade-in duration-300">
    <div className="px-4 pt-8 pb-6 text-center">
      <img src="https://res.cloudinary.com/revrebel/image/upload/v1761516148/RR/Logos/revrebel-logo.png" alt="REVREBEL Logo" className="h-7 w-auto mx-auto mt-4 mb-4 object-contain" />
      <h1 className="text-3xl font-khand font-bold uppercase  text-[var(--clerk-color-foreground)] mb-1">Level Up with Metrics</h1>
      <p className="text-[14px] font-roboto font-medium tracking-wider  text-[var(--clerk-color-neutral)] leading-snug mt-1">
        Connect the dots into a clearer
              </p>
        <p className="text-[14px] font-roboto font-medium tracking-wider  text-[var(--clerk-color-neutral)] leading-snug  mb-3"> 
         view of property performance.
      </p>
    </div>

    <div className="px-8 pb-8 space-y-4">
      <div className="space-y-1.5">
        <label className="text-[13px] font-semibold text-[var(--clerk-color-foreground)] flex justify-between">
           Enter your email to initiate access. 
        </label>
        <input
          type="email"
          className="w-full px-3 py-2 border shadow-sm focus:outline-none focus:ring-2 sm:text-[14px] transition-colors"
          style={{ 
            backgroundColor: 'var(--clerk-color-input)', 
            color: 'var(--clerk-color-input-foreground)',
            borderColor: 'var(--clerk-color-ring)',
            borderRadius: 'var(--clerk-border-radius)',
            '--tw-ring-color': 'var(--clerk-color-primary)',
            '--tw-ring-offset-width': '2px'
          }}
          placeholder="biggs.darklighter@company.com"
        />
      </div>

      <button
        className="w-full flex justify-center py-2.5 px-4 shadow-sm text-[18px] font-khand font-bold uppercase pt-4 focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90 mt-2"
        style={{
            backgroundColor: 'var(--clerk-color-primary)',
            color: 'var(--clerk-color-primary-foreground)',
            borderRadius: 'var(--clerk-border-radius)',
            '--tw-ring-color': 'var(--clerk-color-primary)'
        }}
      >
        Request Access
      </button>
  <p className="text-[12px] font-roboto  text-center font-medium tracking-tight text-[var(--clerk-color-neutral)] leading-snug px-2 pb-4">
      Once approved, we’ll send confirmation straight to your inbox.
      </p>
    </div>

    <ClerkFooter actionText="Already have access?" actionLink="Sign in" />
  </div>
);

const SignInComponent = () => (
  <div className="w-full flex flex-col animate-in fade-in duration-300">
    <div className="px-8 pt-8 pb-6 text-center">
      <img src="https://res.cloudinary.com/revrebel/image/upload/v1761516148/RR/Logos/revrebel-logo.png" alt="REVREBEL Logo" className="h-7 w-auto mx-auto mt-4 mb-10 object-contain" />
      <h1 className="text-3xl font-khand font-bold uppercase text-[var(--clerk-color-foreground)] mb-1">Sign in to Metrics</h1>
      <p className="text-[14px] font-roboto font-medium tracking-wider text-[var(--clerk-color-neutral)] mb-3 leading-snug">
       Sign in to Unlock Smarter Metrics 
      </p>
    </div>

    <div className="px-8 pb-8">
      {/* Social Buttons */}
      <div className="flex gap-3 mb-6">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 border shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
           style={{ 
             backgroundColor: 'var(--clerk-color-input)', 
             borderColor: 'var(--clerk-color-ring)',
             borderRadius: 'var(--clerk-border-radius)',
             color: 'var(--clerk-color-foreground)'
           }}>
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
          </svg>
          <span className="text-[14px] font-medium">GitHub</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 border shadow-sm hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
           style={{ 
             backgroundColor: 'var(--clerk-color-input)', 
             borderColor: 'var(--clerk-color-ring)',
             borderRadius: 'var(--clerk-border-radius)',
             color: 'var(--clerk-color-foreground)'
           }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24">
             <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
             <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
             <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
             <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          <span className="text-[14px] font-medium">Google</span>
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center mb-6">
        <div className="flex-1 border-t border-[var(--clerk-color-ring)]"></div>
        <span className="px-3 text-[13px] text-[var(--clerk-color-neutral)]">or</span>
        <div className="flex-1 border-t border-[var(--clerk-color-ring)]"></div>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-[13px] font-semibold text-[var(--clerk-color-foreground)] flex justify-between items-center">
            Email address
            <button className="text-[13px] font-medium text-[var(--clerk-color-primary)] hover:opacity-80">Use phone</button>
          </label>
          <input
            type="email"
            className="w-full px-3 py-2 border shadow-sm focus:outline-none focus:ring-2 sm:text-[14px] transition-colors"
            style={{ 
              backgroundColor: 'var(--clerk-color-input)', 
              color: 'var(--clerk-color-input-foreground)',
              borderColor: 'var(--clerk-color-ring)',
              borderRadius: 'var(--clerk-border-radius)',
              '--tw-ring-color': 'var(--clerk-color-primary)'
            }}
            placeholder="biggs.darklighter@company.com"
          />
        </div>

        <button
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 shadow-sm text-[18px]  font-khand font-bold uppercase pt-4  focus:outline-none focus:ring-2 focus:ring-offset-2 transition-opacity hover:opacity-90"
          style={{
              backgroundColor: 'var(--clerk-color-primary)',
              color: 'var(--clerk-color-primary-foreground)',
              borderRadius: 'var(--clerk-border-radius)',
              '--tw-ring-color': 'var(--clerk-color-primary)'
          }}
        >
          Continue
          <span className="text-[10px]">▶</span>
        </button>
      </div>
    </div>

    <ClerkFooter actionText="Don't have an account?" actionLink="Sign up" />
  </div>
);

export default function App() {
  const [activeView, setActiveView] = useState('waitlist'); // 'waitlist' | 'signin'

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 font-sans antialiased">
      <ThemeStyles />
      
      {/* View Toggle (Just for this preview environment) */}
      <div className="absolute top-8 flex bg-[var(--clerk-color-input)] border-[3px] border-[var(--clerk-color-ring)]  p-1 shadow-sm" style={{ borderRadius: 'calc(var(--clerk-border-radius) + 0.175rem)' }}>
        <button 
          onClick={() => setActiveView('waitlist')}
          className={`px-4 py-1.5 text-sm font-khand font-bold uppercase transition-all ${activeView === 'waitlist' ? 'bg-[var(--clerk-color-primary)] text-[var(--clerk-color-primary-foreground)] shadow' : 'text-[var(--clerk-color-neutral)] hover:text-[var(--clerk-color-foreground)]'}`}
          style={{ borderRadius: activeView === 'waitlist' ? 'var(--clerk-border-radius)' : '0' }}
        >
          Request Access
        </button>
        <button 
          onClick={() => setActiveView('signin')}
          className={`px-4 py-1.5 text-sm font-khand font-bold uppercase transition-all ${activeView === 'signin' ? 'bg-[var(--clerk-color-primary)] text-[var(--clerk-color-primary-foreground)] shadow' : 'text-[var(--clerk-color-neutral)] hover:text-[var(--clerk-color-foreground)]'}`}
          style={{ borderRadius: activeView === 'signin' ? 'var(--clerk-border-radius)' : '0' }}
        >
          Sign In
        </button>
      </div>

      <div className="z-10 w-full max-w-[435px] mt-12">
        
        {/* Clerk main card container */}
        <div className="shadow-[0_8px_20px_rgb(0,0,0,0.06)] border-[3px] relative overflow-hidden"
             style={{ 
               backgroundColor: 'var(--clerk-color-background)', 
               borderColor: 'var(--clerk-color-ring)',
               borderRadius: 'calc(var(--clerk-border-radius) + 0.375rem)' // Clerk usually has a slightly larger outer radius than inner inputs
             }}>
          
          {activeView === 'waitlist' ? <WaitlistComponent /> : <SignInComponent />}
          
        </div>

      </div>
    </div>
  );
}