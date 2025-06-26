import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-gradient-to-br from-blue-50 to-gray-100 bg-[url('/books-bg.png')] bg-cover bg-center"
      style={{ backgroundImage: `linear-gradient(rgba(255,255,255,0.8), rgba(255,255,255,0.8)), url('/books-bg.png')` }}
    >
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start text-center sm:text-left">
        <div className="flex items-center gap-3">
          <Image
            className="dark:invert"
            src="/studybuddy-logo.svg"
            alt="StudyBuddy logo"
            width={180}
            height={38}
            priority
          />
          <h1 className="text-3xl font-bold text-blue-800">StudyBuddy</h1>
        </div>
        <p className="text-lg text-gray-700 max-w-md">
          Connect with study partners, join groups, and access personalized resources to ace your studies!
        </p>
        <ol className="list-inside list-decimal text-sm/6 font-[family-name:var(--font-geist-mono)] text-gray-600">
          <li className="mb-2 tracking-[-.01em]">
            Get started by creating your profile in{" "}
            <code className="bg-blue-100 dark:bg-blue-900/30 px-1 py-0.5 rounded font-semibold">
              app/profile
            </code>
            .
          </li>
          <li className="tracking-[-.01em]">
            Discover study groups or resources tailored to your subjects.
          </li>
        </ol>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <Link
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-blue-600 text-white gap-2 hover:bg-blue-700 dark:hover:bg-blue-500 font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/join-group"
          >
            <Image
              className="dark:invert"
              src="/group-icon.svg"
              alt="Group icon"
              width={20}
              height={20}
            />
            Join a Study Group
          </Link>
          <Link
            className="rounded-full border border-solid border-blue-200 dark:border-blue-800 transition-colors flex items-center justify-center hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto md:w-[158px]"
            href="/resources"
          >
            Explore Resources
          </Link>
        </div>

        <div className="mt-8 w-full max-w-2xl">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Recommended Study Groups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Python 101</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Beginner-friendly group for learning Python.</p>
              <Link href="/groups/python-101" className="text-blue-600 hover:underline text-sm">Join Now</Link>
            </div>
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">Calculus Study</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Collaborate on calculus problems and concepts.</p>
              <Link href="/groups/calculus" className="text-blue-600 hover:underline text-sm">Join Now</Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-gray-600">
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/learn"
        >
          <Image
            aria-hidden
            src="/book-icon.svg"
            alt="Book icon"
            width={16}
            height={16}
          />
          Learn More
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/groups"
        >
          <Image
            aria-hidden
            src="/group-icon.svg"
            alt="Group icon"
            width={16}
            height={16}
          />
          Browse Groups
        </Link>
        <Link
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="/support"
        >
          <Image
            aria-hidden
            src="/support-icon.svg"
            alt="Support icon"
            width={16}
            height={16}
          />
          Get Support
        </Link>
      </footer>
    </div>
  );
}