import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata = { title: "Student Dashboard" };

export default function Layout({ children }) {
  return <div className={poppins.className}>{children}</div>;
}
