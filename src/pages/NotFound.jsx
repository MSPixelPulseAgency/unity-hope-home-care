import { Seo } from "../components/ui/Seo";
import { Button } from "../components/ui/Button";

export default function NotFound() {
  return (
    <section className="not-found">
      <Seo title="Page Not Found | Unity & Hope Home Care LLC" description="The page you requested could not be found." path="/404" />
      <div className="container not-found-inner">
        <img src="/brand/unity-hope-mark.png" alt="Unity and Hope Home Care mark" width="210" height="210" />
        <p className="error-code">404</p>
        <h1>That page isn’t here, but help is close by.</h1>
        <p>Return home, request care or call Unity & Hope directly.</p>
        <div className="inline-actions"><Button to="/">Return Home</Button><Button to="/request-care" variant="outline">Request Care</Button><Button href="tel:+19372219764" variant="text" icon="Phone">937-221-9764</Button></div>
      </div>
    </section>
  );
}

