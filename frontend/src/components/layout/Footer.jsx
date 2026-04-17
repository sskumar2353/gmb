import { Link } from "react-router-dom";

const linkCls = "text-[#6B7280] hover:text-gm-green";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#E5E7EB] bg-gm-navy-soft/50">
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-3 font-semibold text-gm-navy">About Green miles booking</p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className={linkCls}>Contact us</span>
              </li>
              <li>
                <span className={linkCls}>Offers</span>
              </li>
              <li>
                <Link className={linkCls} to="/search">
                  Bus routes
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-gm-navy">Info</p>
            <ul className="space-y-2 text-sm">
              <li>
                <span className={linkCls}>T&amp;C</span>
              </li>
              <li>
                <span className={linkCls}>Privacy policy</span>
              </li>
              <li>
                <Link className={linkCls} to="/#faq">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-gm-navy">Book</p>
            <ul className="space-y-2 text-sm">
              <li>
                <Link className={linkCls} to="/search">
                  Bus tickets
                </Link>
              </li>
              <li>
                <Link className={linkCls} to="/courier">
                  Courier
                </Link>
              </li>
              <li>
                <Link className={linkCls} to="/dashboard">
                  My bookings
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold text-gm-navy">Popular cities</p>
            <p className="text-sm leading-relaxed text-[#6B7280]">
              Hyderabad · Bangalore · Chennai · Pune · Delhi · Mumbai · Kolkata
            </p>
          </div>
        </div>
        <p className="mt-8 border-t border-[#E5E7EB] pt-6 text-center text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} Green miles booking · Bus booking UI demo — not affiliated with third-party operators.
        </p>
      </div>
    </footer>
  );
}
