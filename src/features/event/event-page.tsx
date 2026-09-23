import Image from "next/image";
import { Suspense, type ReactElement } from "react";
import { InterestMessage } from "@/features/interest/interest-message";
import { RegistrationForm } from "@/features/registration/registration-form";
import { PhotoCollage } from "./photo-collage";

const heroClasses = `
  relative isolate flex items-center justify-center overflow-hidden
  px-6 pt-14 pb-12 sm:px-10 sm:pt-20 sm:pb-16
`;

const backgroundOverlayClasses = `
  pointer-events-none absolute inset-0 -z-10
  bg-[linear-gradient(to_bottom,rgba(0,0,0,0.5)_0%,rgba(0,0,0,0.6)_55%,#000_100%)]
`;

const titleClasses = `
  font-display text-[clamp(3.25rem,14vw,5rem)] leading-[1.06]
  font-normal tracking-[0.035em]
  sm:text-[clamp(4rem,8.5vw,7.5rem)] sm:leading-tight
`;

const subtitleClasses = `
  mt-4 font-display text-[0.8rem] leading-relaxed tracking-[0.18em] text-amber-hover
  sm:mt-1 sm:text-lg sm:tracking-[0.25em]
`;

const footerClasses = `
  bg-ink px-6 pb-12 text-center font-editorial text-muted sm:px-10 sm:pb-14
`;

const footerContentClasses = `
  mx-auto flex max-w-6xl flex-col items-center gap-4
  pt-9 sm:flex-row sm:justify-between sm:pt-12
`;

const prizeClasses = `
  mx-auto mt-6 w-fit border-y border-amber/60 px-4 py-2
  font-display text-sm tracking-[0.16em] text-amber-hover sm:text-base
`;

export function EventPage(): ReactElement {
  return (
    <>
      <main>
        <div className={heroClasses}>
          <div aria-hidden="true" className="pointer-events-none absolute -inset-4 -z-20">
            <Image
              src="/images/background.jpeg"
              alt=""
              fill
              preload
              sizes="100vw"
              className="object-cover object-[43%_center] blur-[4px] sm:object-[center_55%]"
            />
          </div>
          <div
            aria-hidden="true"
            className={backgroundOverlayClasses}
          />

          <div className="w-full max-w-5xl text-center">
            <header>
              <h1 className={titleClasses}>
                <span className="block sm:inline">HOCUS</span>{" "}
                <span className="block sm:inline">POCUS</span>
              </h1>
              <p className={subtitleClasses}>
                HALLOWEEN PARTY 2026
              </p>
            </header>

            <RegistrationForm>
              <div aria-hidden="true" className="mx-auto my-7 h-px w-12 bg-amber/70 sm:my-8" />
              <p className="font-editorial text-lg leading-relaxed sm:text-xl">
                Saturday 31st October
              </p>
              <ul
                aria-label="Event details"
                className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 font-editorial text-xs leading-relaxed text-muted sm:text-sm"
              >
                <li>Hell gates open at 7pm</li>
                <li>Secret location</li>
                <li>Costume party</li>
              </ul>
              <p className={prizeClasses}>BEST COSTUME WINS 70€</p>
              <p
                id="registration-intro"
                className="mx-auto mt-7 max-w-md text-balance font-editorial text-sm leading-7 text-parchment/90 sm:mt-8"
              >
                Register now to guarantee your entrance ticket.
              </p>
            </RegistrationForm>
            <div className="relative mx-auto max-w-lg">
              <Suspense fallback={null}>
                <InterestMessage />
              </Suspense>
            </div>
          </div>
        </div>
        <PhotoCollage />
      </main>

      <footer className={footerClasses}>
        <div className={footerContentClasses}>
          <p className="text-xs">
            Private event by <span className="ml-1 font-display text-base tracking-widest text-parchment">PIÙ</span>
          </p>
          <p className="max-w-64 text-[0.65rem] leading-6 sm:max-w-none sm:text-xs">
            Website by Michael Grinnell <span aria-hidden="true">·</span>{" "}
            <a
              className="underline decoration-rule underline-offset-4 hover:text-parchment"
              href="https://michaelgrinnell.com"
            >
              michaelgrinnell.com
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
