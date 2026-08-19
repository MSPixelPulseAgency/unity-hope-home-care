import { Seo } from "../components/ui/Seo";
import { Button } from "../components/ui/Button";
import { siteConfig } from "../config/siteConfig";
import { pageSeo } from "../data/seo";

export default function NotFound() {
  return (
    <section className="not-found">
      <Seo {...pageSeo.notFound} />
      <div className="container not-found-inner">
        <img src="/brand/unity-hope-mark.webp" alt="Unity and Hope Home Care mark" width="210" height="210" />
        <p className="error-code">404</p>
        <h1>That page isn’t here, but help is close by.</h1>
        <p>Return home, request care or call Unity & Hope directly.</p>
        <div className="inline-actions"><Button to="/">Return Home</Button><Button to="/request-care" variant="outline">Request Care</Button><Button href={siteConfig.phoneHref} variant="text" icon="Phone">{siteConfig.phone}</Button></div>
      </div>
    </section>
  );
}
