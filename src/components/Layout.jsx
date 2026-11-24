import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        target.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <main id="main">
        <Suspense fallback={<div className="page-loading" role="status">Loading</div>}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
