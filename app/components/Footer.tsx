import { Github } from "./SocialIcons";
import Link from "next/link";
import { Brand } from "./Brand";
import packageJson from "@/package.json";

export function Footer() {
  return <footer className="site-footer"><div className="footer-inner"><Brand /><p className="footer-credit">A little less marketing. A lot more building.<span>v{packageJson.version}</span></p><nav className="footer-links" aria-label="Footer navigation"><Link href="/faq">FAQ</Link><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link><a href="https://github.com/rexdavinci/featurelogs" target="_blank" rel="noreferrer" aria-label="FeatureLogs on GitHub"><Github size={14} /></a></nav></div></footer>;
}
