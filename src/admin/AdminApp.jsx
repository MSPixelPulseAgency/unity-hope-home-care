import { useCallback, useEffect, useState } from "react";
import { Icon } from "../components/ui/Icon";

const NAV_ITEMS = [
  ["dashboard", "LayoutDashboard", "Dashboard"],
  ["website", "PanelsTopLeft", "Website Content"],
  ["services", "HeartHandshake", "Services"],
  ["areas", "MapPin", "Service Areas"],
  ["team", "UsersRound", "Team"],
  ["reviews", "MessageCircleHeart", "Reviews"],
  ["applications", "BriefcaseBusiness", "Applications"],
  ["resources", "BookOpen", "Blog & Resources"],
  ["seo", "Search", "SEO"],
  ["submissions", "Inbox", "Submissions"],
];

const emptyService = () => ({
  slug: "new-service", title: "New Service", shortTitle: "New Service", icon: "HeartHandshake",
  image: "/images/caregiver-welcome.webp", description: "", intro: "", examples: [], note: "",
  tags: [], seoTitle: "", seoDescription: "", hidden: true,
});
const emptyArea = () => ({ name: "New Area", gridArea: "newarea", primary: false, detail: "", hidden: true });
const emptyTeamMember = () => ({ id: `team-${Date.now()}`, name: "New Team Member", role: "", bio: "", image: "/images/caregiver-team.webp", imageAlt: "", hidden: true });
const emptyResource = () => ({
  slug: "new-article", title: "New Article", excerpt: "", image: "/images/family-cooking.webp",
  imageAlt: "", readTime: "5 min read", author: "Unity & Hope Home Care LLC", publishedDate: "",
  status: "draft", sections: [{ heading: "Introduction", body: "" }], seoTitle: "", seoDescription: "",
});

const api = async (path, { csrf, ...options } = {}) => {
  const response = await fetch(path, {
    credentials: "same-origin",
    ...options,
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(csrf ? { "X-CSRF-Token": csrf } : {}),
      ...(options.headers || {}),
    },
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(result.error || "The request could not be completed.");
    error.status = response.status;
    throw error;
  }
  return result;
};

const encodeFile = async (file) => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  for (let index = 0; index < bytes.length; index += 32768) {
    binary += String.fromCharCode(...bytes.subarray(index, index + 32768));
  }
  return btoa(binary);
};

function AuthScreen({ onAuthenticated }) {
  const resetToken = new URLSearchParams(window.location.search).get("token");
  const [mode, setMode] = useState(resetToken ? "reset" : "login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "", message: "" });

  const submit = async (event) => {
    event.preventDefault();
    if (mode === "reset" && password !== confirmPassword) {
      setStatus({ loading: false, error: "Passwords do not match.", message: "" });
      return;
    }
    setStatus({ loading: true, error: "", message: "" });
    try {
      const body = mode === "login"
        ? { action: "login", email, password }
        : mode === "forgot"
          ? { action: "request-reset", email }
          : { action: "reset-password", token: resetToken, password };
      const result = await api("/api/admin-auth", { method: "POST", body: JSON.stringify(body) });
      if (mode === "login") onAuthenticated(result);
      else if (mode === "reset") {
        window.history.replaceState({}, "", "/");
        setMode("login");
        setPassword("");
        setConfirmPassword("");
        setStatus({ loading: false, error: "", message: result.message });
      } else {
        setStatus({ loading: false, error: "", message: result.message });
      }
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: "" });
    }
  };

  return (
    <main className="admin-auth-shell">
      <section className="admin-auth-card" aria-labelledby="admin-auth-title">
        <img src="/brand/unity-hope-logo.webp" alt="Unity and Hope Home Care LLC" width="240" height="210" />
        <p className="admin-eyebrow">Secure owner portal</p>
        <h1 id="admin-auth-title">{mode === "login" ? "Welcome back" : mode === "forgot" ? "Reset your password" : "Choose a new password"}</h1>
        <p>{mode === "login" ? "Sign in to manage website content, reviews and inquiries." : mode === "forgot" ? "We’ll send a one-time reset link if this email is authorized." : "Use at least 14 characters with a letter, number and symbol."}</p>
        <form onSubmit={submit}>
          {mode !== "reset" && <label>Email address<input type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>}
          {mode !== "forgot" && <label>{mode === "login" ? "Password" : "New password"}<span className="admin-password-field"><input type={showPassword ? "text" : "password"} autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={mode === "reset" ? 14 : undefined} value={password} onChange={(event) => setPassword(event.target.value)} required /><button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((visible) => !visible)}><Icon name={showPassword ? "EyeOff" : "Eye"} size={20} /></button></span></label>}
          {mode === "reset" && <label>Confirm new password<input type={showPassword ? "text" : "password"} autoComplete="new-password" minLength="14" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></label>}
          {status.error && <p className="admin-alert admin-alert-error" role="alert">{status.error}</p>}
          {status.message && <p className="admin-alert admin-alert-success" role="status">{status.message}</p>}
          <button className="admin-primary-button" disabled={status.loading}>{status.loading ? "Please wait…" : mode === "login" ? "Sign In" : mode === "forgot" ? "Send Reset Link" : "Update Password"}</button>
        </form>
        <button className="admin-text-button" type="button" onClick={() => { setMode(mode === "login" ? "forgot" : "login"); setStatus({ loading: false, error: "", message: "" }); }}>
          {mode === "login" ? "Forgot password?" : "Back to sign in"}
        </button>
        <a href="https://uhhomehealth.com">Return to public website</a>
      </section>
    </main>
  );
}

function Field({ label, value, onChange, type = "text", help, required, rows, children }) {
  return (
    <label className={rows ? "admin-field admin-field-wide" : "admin-field"}>
      <span>{label}{required ? " *" : ""}</span>
      {children || (rows
        ? <textarea rows={rows} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} />
        : <input type={type} value={value ?? ""} onChange={(event) => onChange(event.target.value)} required={required} />)}
      {help && <small>{help}</small>}
    </label>
  );
}

function Toggle({ label, checked, onChange }) {
  return <label className="admin-toggle"><input type="checkbox" checked={Boolean(checked)} onChange={(event) => onChange(event.target.checked)} /><span aria-hidden="true" /><b>{label}</b></label>;
}

function EditorToolbar({ title, description, onSave, saving, action }) {
  return (
    <div className="admin-page-heading">
      <div><p className="admin-eyebrow">Unity &amp; Hope</p><h1>{title}</h1>{description && <p>{description}</p>}</div>
      <div className="admin-heading-actions">{action}<button className="admin-primary-button" type="button" onClick={onSave} disabled={saving}>{saving ? "Saving…" : "Save Changes"}</button></div>
    </div>
  );
}

function ImageField({ value, onChange, csrf, label = "Image" }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const upload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024) {
      setError("Choose a JPEG, PNG or WebP image up to 4 MB.");
      event.target.value = "";
      return;
    }
    setUploading(true);
    setError("");
    try {
      const result = await api("/api/admin?section=media", { method: "POST", csrf, body: JSON.stringify({ contentType: file.type, content: await encodeFile(file) }) });
      onChange(result.path);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };
  return (
    <div className="admin-image-field">
      <Field label={`${label} path or HTTPS URL`} value={value} onChange={onChange} />
      {value && <img src={value} alt="Current selection preview" width="180" height="120" />}
      <label className="admin-upload-button"><Icon name="Upload" size={18} /> {uploading ? "Uploading…" : "Upload image"}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={upload} disabled={uploading} /></label>
      {error && <small className="admin-error-text" role="alert">{error}</small>}
    </div>
  );
}

function Dashboard({ data, onNavigate }) {
  const cards = [
    ["New inquiries", data?.counts?.inquiries || 0, "Inbox", "submissions"],
    ["Care requests", data?.counts?.careRequests || 0, "HeartHandshake", "submissions"],
    ["Applications", data?.counts?.applications || 0, "BriefcaseBusiness", "applications"],
    ["Pending reviews", data?.counts?.pendingReviews || 0, "MessageCircleHeart", "reviews"],
  ];
  return (
    <>
      <div className="admin-page-heading"><div><p className="admin-eyebrow">At a glance</p><h1>Dashboard</h1><p>Manage the Unity &amp; Hope website and follow up with families.</p></div><a className="admin-secondary-button" href="https://uhhomehealth.com" target="_blank" rel="noreferrer">View Website <Icon name="ExternalLink" size={17} /></a></div>
      <div className="admin-stat-grid">{cards.map(([label, count, icon, section]) => <button key={label} onClick={() => onNavigate(section)}><Icon name={icon} size={25} /><span>{label}</span><strong>{count}</strong></button>)}</div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel"><h2>Recent submissions</h2>{data?.recentSubmissions?.length ? data.recentSubmissions.map((item) => <button className="admin-list-row" key={item.id} onClick={() => onNavigate(item.formType === "career" ? "applications" : "submissions")}><span><strong>{item.fields?.name || "Website visitor"}</strong><small>{item.formType} · {new Date(item.createdAt).toLocaleDateString()}</small></span><b>{item.status}</b></button>) : <EmptyState text="No submissions yet." />}</section>
        <section className="admin-panel"><h2>Recent reviews</h2>{data?.recentReviews?.length ? data.recentReviews.map((item) => <button className="admin-list-row" key={item.id} onClick={() => onNavigate("reviews")}><span><strong>{item.name}</strong><small>{item.relationship} · {new Date(item.createdAt).toLocaleDateString()}</small></span><b>{item.status}</b></button>) : <EmptyState text="No reviews yet." />}</section>
      </div>
    </>
  );
}

function EmptyState({ text, action }) {
  return <div className="admin-empty"><Icon name="Inbox" size={30} /><p>{text}</p>{action}</div>;
}

function LoadState({ state, label, retry }) {
  if (state !== "error") return <div className="admin-loading" role="status">Loading {label}…</div>;
  return <div className="admin-load-error" role="alert"><Icon name="AlertTriangle" size={30} /><h2>We couldn’t load {label}</h2><p>Check your connection and try again. No changes were made.</p><button className="admin-secondary-button" type="button" onClick={retry}><Icon name="RefreshCw" size={18} /> Try Again</button></div>;
}

function WebsiteEditor({ content, setContent, save, saving }) {
  const site = content.site;
  const hero = content.home.hero;
  const setSite = (key, value) => setContent((current) => ({ ...current, site: { ...current.site, [key]: value } }));
  const setHours = (key, value) => setContent((current) => ({ ...current, site: { ...current.site, hours: { ...current.site.hours, [key]: value } } }));
  const setSocial = (key, value) => setContent((current) => ({ ...current, site: { ...current.site, socials: { ...current.site.socials, [key]: value } } }));
  const setHero = (key, value) => setContent((current) => ({ ...current, home: { ...current.home, hero: { ...current.home.hero, [key]: value } } }));
  const setHome = (key, value) => setContent((current) => ({ ...current, home: { ...current.home, [key]: value } }));
  const setServicesHeading = (key, value) => setContent((current) => ({ ...current, home: { ...current.home, servicesHeading: { ...current.home.servicesHeading, [key]: value } } }));
  const setMission = (key, value) => setContent((current) => ({ ...current, about: { ...current.about, mission: { ...current.about.mission, [key]: value } } }));
  const setVisibility = (key, value) => setContent((current) => ({ ...current, home: { ...current.home, sectionVisibility: { ...current.home.sectionVisibility, [key]: value } } }));
  return (
    <>
      <EditorToolbar title="Website Content" description="Update core contact details, homepage messaging and section visibility." onSave={async () => { await save("site"); await save("home"); await save("about"); }} saving={saving} />
      <section className="admin-panel"><h2>Business details</h2><div className="admin-form-grid">
        <Field label="Company name" value={site.companyName} onChange={(value) => setSite("companyName", value)} required />
        <Field label="Phone" value={site.phone} onChange={(value) => setSite("phone", value)} required />
        <Field label="Public email" type="email" value={site.email} onChange={(value) => setSite("email", value)} required />
        <Field label="Fax" value={site.fax} onChange={(value) => setSite("fax", value)} />
        <Field label="Street address" value={site.addressLine1} onChange={(value) => setSite("addressLine1", value)} />
        <Field label="City" value={site.city} onChange={(value) => setSite("city", value)} />
        <Field label="State" value={site.state} onChange={(value) => setSite("state", value)} />
        <Field label="ZIP code" value={site.postalCode} onChange={(value) => setSite("postalCode", value)} />
        <Field label="Footer description" rows={3} value={site.footerDescription} onChange={(value) => setSite("footerDescription", value)} />
        <Field label="Weekday label" value={site.hours.weekdaysLabel} onChange={(value) => setHours("weekdaysLabel", value)} />
        <Field label="Weekday hours" value={site.hours.weekdays} onChange={(value) => setHours("weekdays", value)} />
        <Field label="Weekend label" value={site.hours.weekendsLabel} onChange={(value) => setHours("weekendsLabel", value)} />
        <Field label="Weekend hours" value={site.hours.weekends} onChange={(value) => setHours("weekends", value)} />
      </div></section>
      <section className="admin-panel"><h2>Homepage hero</h2><div className="admin-form-grid">
        <Field label="Eyebrow" value={hero.kicker} onChange={(value) => setHero("kicker", value)} />
        <Field label="Heading first line" value={hero.title} onChange={(value) => setHero("title", value)} required />
        <Field label="Heading accent" value={hero.titleAccent} onChange={(value) => setHero("titleAccent", value)} required />
        <Field label="Description" rows={4} value={hero.description} onChange={(value) => setHero("description", value)} />
      </div></section>
      <section className="admin-panel"><h2>Homepage services &amp; area</h2><div className="admin-form-grid">
        <Field label="Services eyebrow" value={content.home.servicesHeading.eyebrow} onChange={(value) => setServicesHeading("eyebrow", value)} />
        <Field label="Services heading" value={content.home.servicesHeading.title} onChange={(value) => setServicesHeading("title", value)} />
        <Field label="Services description" rows={3} value={content.home.servicesHeading.description} onChange={(value) => setServicesHeading("description", value)} />
        <Field label="Service area heading" value={content.home.serviceAreaWording} onChange={(value) => setHome("serviceAreaWording", value)} />
      </div></section>
      <section className="admin-panel"><h2>About page mission</h2><div className="admin-form-grid">
        <Field label="Eyebrow" value={content.about.mission.eyebrow} onChange={(value) => setMission("eyebrow", value)} />
        <Field label="Mission heading" value={content.about.mission.title} onChange={(value) => setMission("title", value)} />
        <Field label="Lead paragraph" rows={3} value={content.about.mission.lead} onChange={(value) => setMission("lead", value)} />
        <Field label="Mission paragraphs (one per line)" rows={6} value={(content.about.mission.paragraphs || []).join("\n")} onChange={(value) => setMission("paragraphs", value.split("\n"))} />
        <Field label="Vision statement" rows={4} value={content.about.vision} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, vision: value } }))} help="Leave blank until approved." />
        <Field label="Founder story" rows={7} value={content.about.founderStory} onChange={(value) => setContent((current) => ({ ...current, about: { ...current.about, founderStory: value } }))} help="Leave blank until approved." />
      </div></section>
      <section className="admin-panel"><h2>Footer, CTAs &amp; social profiles</h2><div className="admin-form-grid">
        <Field label="Footer CTA eyebrow" value={site.footerCtaEyebrow} onChange={(value) => setSite("footerCtaEyebrow", value)} />
        <Field label="Footer CTA title" value={site.footerCtaTitle} onChange={(value) => setSite("footerCtaTitle", value)} />
        <Field label="Footer CTA description" rows={3} value={site.footerCtaDescription} onChange={(value) => setSite("footerCtaDescription", value)} />
        <Field label="Primary CTA label" value={site.primaryCtaLabel} onChange={(value) => setSite("primaryCtaLabel", value)} />
        <Field label="Facebook HTTPS URL" type="url" value={site.socials?.facebook || ""} onChange={(value) => setSocial("facebook", value)} />
        <Field label="Instagram HTTPS URL" type="url" value={site.socials?.instagram || ""} onChange={(value) => setSocial("instagram", value)} />
        <Field label="LinkedIn HTTPS URL" type="url" value={site.socials?.linkedin || ""} onChange={(value) => setSocial("linkedin", value)} />
      </div></section>
      <section className="admin-panel"><h2>Homepage sections</h2><div className="admin-toggle-grid">{Object.entries(content.home.sectionVisibility).map(([key, visible]) => <Toggle key={key} label={key.replace(/([A-Z])/g, " $1").replace(/^./, (letter) => letter.toUpperCase())} checked={visible} onChange={(value) => setVisibility(key, value)} />)}</div></section>
    </>
  );
}

function CollectionEditor({ type, items, setItems, save, saving, csrf }) {
  const config = {
    services: { title: "Services", description: "Add, edit, reorder or hide public care services.", create: emptyService },
    areas: { title: "Service Areas", description: "Maintain the public list of counties and availability wording.", create: emptyArea },
    team: { title: "Team", description: "Manage team profiles without changing the website layout.", create: emptyTeamMember },
  }[type];
  const update = (index, key, value) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const move = (index, direction) => setItems((current) => {
    const target = index + direction;
    if (target < 0 || target >= current.length) return current;
    const next = [...current];
    [next[index], next[target]] = [next[target], next[index]];
    return next;
  });
  const remove = (index) => { if (window.confirm("Delete this item? This takes effect after you save.")) setItems((current) => current.filter((_, itemIndex) => itemIndex !== index)); };
  return (
    <>
      <EditorToolbar title={config.title} description={config.description} onSave={save} saving={saving} action={<button className="admin-secondary-button" type="button" onClick={() => setItems((current) => [...current, config.create()])}><Icon name="Plus" size={18} /> Add New</button>} />
      <div className="admin-collection">{items.length ? items.map((item, index) => <details className="admin-editor-card" key={`${item.slug || item.id || item.name}-${index}`} open={index === 0}>
        <summary><span><b>{item.title || item.name}</b><small>{item.hidden ? "Hidden" : "Visible"}</small></span><Icon name="ChevronDown" size={20} /></summary>
        <div className="admin-editor-card-body"><div className="admin-item-actions"><button onClick={() => move(index, -1)} disabled={!index} aria-label="Move up"><Icon name="ArrowUp" size={18} /></button><button onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label="Move down"><Icon name="ArrowDown" size={18} /></button><button className="admin-danger-button" onClick={() => remove(index)}><Icon name="Trash2" size={17} /> Delete</button></div>
          <div className="admin-form-grid">
            {type === "services" && <><Field label="Title" value={item.title} onChange={(value) => update(index, "title", value)} required /><Field label="Short title" value={item.shortTitle} onChange={(value) => update(index, "shortTitle", value)} /><Field label="URL slug" value={item.slug} onChange={(value) => update(index, "slug", value)} help="Lowercase words separated by hyphens." /><Field label="Icon name" value={item.icon} onChange={(value) => update(index, "icon", value)} /><Field label="Card description" rows={3} value={item.description} onChange={(value) => update(index, "description", value)} /><Field label="Page introduction" rows={4} value={item.intro} onChange={(value) => update(index, "intro", value)} /><Field label="Examples (one per line)" rows={5} value={(item.examples || []).join("\n")} onChange={(value) => update(index, "examples", value.split("\n"))} /><Field label="Tags/features (one per line)" rows={4} value={(item.tags || []).join("\n")} onChange={(value) => update(index, "tags", value.split("\n"))} /><Field label="Service note" rows={3} value={item.note} onChange={(value) => update(index, "note", value)} /><Field label="SEO title" value={item.seoTitle} onChange={(value) => update(index, "seoTitle", value)} /><Field label="SEO description" rows={3} value={item.seoDescription} onChange={(value) => update(index, "seoDescription", value)} /></>}
            {type === "areas" && <><Field label="Area name" value={item.name} onChange={(value) => update(index, "name", value)} required /><Field label="Map grid key" value={item.gridArea} onChange={(value) => update(index, "gridArea", value)} /><Field label="Detail" value={item.detail} onChange={(value) => update(index, "detail", value)} /><Toggle label="Primary service area" checked={item.primary} onChange={(value) => update(index, "primary", value)} /></>}
            {type === "team" && <><Field label="Name" value={item.name} onChange={(value) => update(index, "name", value)} required /><Field label="Role" value={item.role} onChange={(value) => update(index, "role", value)} /><Field label="Biography" rows={5} value={item.bio} onChange={(value) => update(index, "bio", value)} /><Field label="Image alt text" value={item.imageAlt} onChange={(value) => update(index, "imageAlt", value)} /></>}
          </div>
          {(type === "services" || type === "team") && <ImageField value={item.image} onChange={(value) => update(index, "image", value)} csrf={csrf} />}
          <Toggle label="Hide from public website" checked={item.hidden} onChange={(value) => update(index, "hidden", value)} />
        </div>
      </details>) : <EmptyState text={type === "team" ? "No team profiles have been added. Add a profile when the details are approved." : `No ${config.title.toLowerCase()} have been added.`} action={<button className="admin-secondary-button" type="button" onClick={() => setItems([config.create()])}><Icon name="Plus" size={18} /> Add {type === "team" ? "Team Member" : "New Item"}</button>} />}</div>
    </>
  );
}

function ReviewsManager({ reviews, refresh, mutate, busy }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const actions = { pending: ["approve", "decline"], approved: ["hide"], rejected: ["approve"], hidden: ["publish"] };
  const visibleReviews = reviews.filter((review) => {
    const matchesStatus = filter === "all" || review.status === filter;
    const haystack = `${review.name} ${review.relationship} ${review.reviewText}`.toLowerCase();
    return matchesStatus && haystack.includes(query.trim().toLowerCase());
  });
  return (
    <><div className="admin-page-heading"><div><p className="admin-eyebrow">Moderation</p><h1>Reviews</h1><p>Only approved and published reviews appear on the public website.</p></div><button className="admin-secondary-button" onClick={refresh}><Icon name="RefreshCw" size={18} /> Refresh</button></div>
      <div className="admin-search-row"><label><span className="sr-only">Search reviews</span><Icon name="Search" size={18} /><input type="search" placeholder="Search reviews" value={query} onChange={(event) => setQuery(event.target.value)} /></label><label><span className="sr-only">Filter review status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All statuses</option><option value="pending">Pending</option><option value="approved">Approved</option><option value="hidden">Hidden</option><option value="rejected">Rejected</option></select></label></div>
      <div className="admin-collection">{visibleReviews.length ? visibleReviews.map((review) => <article className="admin-panel admin-review-card" key={review.id}><div><div className="admin-card-meta"><b>{review.status}</b><span>{new Date(review.createdAt).toLocaleString()}</span></div><h2>{review.name}</h2><p className="admin-muted">{review.relationship}{review.rating ? ` · ${review.rating}/5 stars` : ""}</p><blockquote>“{review.reviewText}”</blockquote></div><div className="admin-row-actions">{(actions[review.status] || []).map((action) => <button key={action} className={action === "decline" ? "admin-secondary-button" : "admin-primary-button"} disabled={busy} onClick={() => mutate(review.id, action)}>{action[0].toUpperCase() + action.slice(1)}</button>)}<button className="admin-danger-button" disabled={busy} onClick={() => window.confirm("Permanently delete this review?") && mutate(review.id, "delete")}><Icon name="Trash2" size={17} /> Delete</button></div></article>) : <EmptyState text="No matching reviews." />}</div>
    </>
  );
}

function ResourcesEditor({ items, setItems, save, saving, csrf }) {
  const update = (index, key, value) => setItems((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  const updateSection = (itemIndex, sectionIndex, key, value) => setItems((current) => current.map((item, index) => index !== itemIndex ? item : {
    ...item,
    sections: item.sections.map((section, indexValue) => indexValue === sectionIndex ? { ...section, [key]: value } : section),
  }));
  const addButton = <button className="admin-secondary-button" type="button" onClick={() => setItems((current) => [...current, emptyResource()])}><Icon name="Plus" size={18} /> New Article</button>;
  return (
    <>
      <EditorToolbar title="Blog & Resources" description="Create original educational content, keep drafts private and publish when ready." onSave={save} saving={saving} action={addButton} />
      <div className="admin-collection">
        {items.length ? items.map((item, itemIndex) => (
          <details className="admin-editor-card" key={`${item.slug}-${itemIndex}`}>
            <summary><span><b>{item.title}</b><small>{item.status}</small></span><Icon name="ChevronDown" size={20} /></summary>
            <div className="admin-editor-card-body">
              <div className="admin-item-actions"><button className="admin-danger-button" type="button" onClick={() => window.confirm("Delete this article after the next save?") && setItems((current) => current.filter((_, index) => index !== itemIndex))}><Icon name="Trash2" size={17} /> Delete</button></div>
              <div className="admin-form-grid">
                <Field label="Article title" value={item.title} onChange={(value) => update(itemIndex, "title", value)} required />
                <Field label="URL slug" value={item.slug} onChange={(value) => update(itemIndex, "slug", value)} />
                <Field label="Excerpt" rows={3} value={item.excerpt} onChange={(value) => update(itemIndex, "excerpt", value)} />
                <Field label="Image alt text" value={item.imageAlt} onChange={(value) => update(itemIndex, "imageAlt", value)} />
                <Field label="Author" value={item.author} onChange={(value) => update(itemIndex, "author", value)} />
                <Field label="Publish date" type="date" value={item.publishedDate} onChange={(value) => update(itemIndex, "publishedDate", value)} />
                <Field label="Read time" value={item.readTime} onChange={(value) => update(itemIndex, "readTime", value)} />
                <Field label="Status" value={item.status} onChange={() => {}}><select value={item.status} onChange={(event) => update(itemIndex, "status", event.target.value)}><option value="draft">Draft</option><option value="published">Published</option></select></Field>
                <Field label="SEO title" value={item.seoTitle} onChange={(value) => update(itemIndex, "seoTitle", value)} />
                <Field label="SEO description" rows={3} value={item.seoDescription} onChange={(value) => update(itemIndex, "seoDescription", value)} />
              </div>
              <ImageField value={item.image} onChange={(value) => update(itemIndex, "image", value)} csrf={csrf} label="Article image" />
              <div className="admin-sections-editor">
                <h3>Article sections</h3>
                {(item.sections || []).map((section, sectionIndex) => <div className="admin-section-row" key={sectionIndex}><Field label={`Heading ${sectionIndex + 1}`} value={section.heading} onChange={(value) => updateSection(itemIndex, sectionIndex, "heading", value)} /><Field label="Body" rows={7} value={section.body} onChange={(value) => updateSection(itemIndex, sectionIndex, "body", value)} /><button className="admin-danger-button" type="button" onClick={() => update(itemIndex, "sections", item.sections.filter((_, index) => index !== sectionIndex))}><Icon name="Trash2" size={16} /> Remove section</button></div>)}
                <button className="admin-secondary-button" type="button" onClick={() => update(itemIndex, "sections", [...(item.sections || []), { heading: "", body: "" }])}><Icon name="Plus" size={17} /> Add Section</button>
              </div>
            </div>
          </details>
        )) : <EmptyState text="No resources have been added." action={addButton} />}
      </div>
    </>
  );
}

function SeoEditor({ seo, setSeo, save, saving }) {
  const update = (key, field, value) => setSeo((current) => ({ ...current, [key]: { ...current[key], [field]: value } }));
  return <><EditorToolbar title="SEO" description="Edit unique search titles and descriptions. Canonical URLs remain protected." onSave={save} saving={saving} /><div className="admin-collection">{Object.entries(seo).map(([key, entry]) => <section className="admin-panel" key={key}><div className="admin-card-meta"><b>{key}</b><span>{entry.path}</span></div><div className="admin-form-grid"><Field label="Meta title" value={entry.title} onChange={(value) => update(key, "title", value)} /><Field label="Meta description" rows={3} value={entry.description} onChange={(value) => update(key, "description", value)} /></div></section>)}</div></>;
}

const submissionStatusOptions = [
  ["new", "New"],
  ["reviewing", "Reviewing"],
  ["contacted", "Contacted"],
  ["closed", "Closed"],
  ["read", "Read (legacy)"],
  ["in-progress", "In progress (legacy)"],
  ["completed", "Completed (legacy)"],
];

const submissionLabel = (formType) => ({
  contact: "Contact inquiry",
  "request-care": "Care request",
  career: "Caregiver application",
}[formType] || "Website submission");

const defaultEmailSubject = (item) => item.formType === "career"
  ? "Following up on your Unity & Hope application"
  : "Following up on your Unity & Hope inquiry";

function SubmissionCard({ item, busy, onUpdate, onDelete, onEmail }) {
  const [notes, setNotes] = useState(item.notes || "");
  const [subject, setSubject] = useState(defaultEmailSubject(item));
  const [message, setMessage] = useState("");
  const sendEmail = async (event) => {
    event.preventDefault();
    const sent = await onEmail(item.id, subject, message);
    if (sent) setMessage("");
  };
  return (
    <details className="admin-editor-card" key={item.id}>
      <summary>
        <span><b>{item.fields?.name || "Website visitor"}</b><small>{submissionLabel(item.formType)} · {new Date(item.createdAt).toLocaleString()}</small></span>
        <span className="admin-summary-status"><b>{item.status}</b>{item.archived && <small>Archived</small>}</span>
      </summary>
      <div className="admin-editor-card-body">
        <dl className="admin-details-list">{Object.entries(item.fields || {}).filter(([, value]) => value !== "" && value !== false && value != null).map(([key, value]) => <div key={key}><dt>{key.replace(/([A-Z])/g, " $1")}</dt><dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd></div>)}</dl>
        <section className="admin-workflow-panel" aria-labelledby={`workflow-${item.id}`}>
          <h3 id={`workflow-${item.id}`}>Follow-up workflow</h3>
          <div className="admin-workflow-grid">
            <label className="admin-status-select">Status<select value={item.status} disabled={busy} onChange={(event) => onUpdate(item.id, { status: event.target.value })}>{submissionStatusOptions.map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
            <Field label="Private owner notes" rows={4} value={notes} onChange={setNotes} help="Visible only to signed-in administrators." />
          </div>
          <div className="admin-row-actions admin-row-actions-start">
            <button className="admin-primary-button" type="button" disabled={busy || notes === (item.notes || "")} onClick={() => onUpdate(item.id, { notes })}><Icon name="NotebookPen" size={17} /> Save Notes</button>
            {item.resume && <a className="admin-secondary-button" href={`/api/admin?section=submission-file&id=${item.id}`}><Icon name="Download" size={17} /> Download {item.resume.filename}</a>}
            <button className="admin-secondary-button" type="button" disabled={busy} onClick={() => onUpdate(item.id, { archived: !item.archived })}><Icon name={item.archived ? "ArchiveRestore" : "Archive"} size={17} /> {item.archived ? "Restore" : "Archive"}</button>
            <button className="admin-danger-button" type="button" disabled={busy} onClick={() => window.confirm("Permanently delete this submission and its attachment? This cannot be undone.") && onDelete(item.id)}><Icon name="Trash2" size={17} /> Delete</button>
          </div>
        </section>
        <details className="admin-email-composer">
          <summary><Icon name="Mail" size={18} /> Email {item.formType === "career" ? "Applicant" : "Submitter"}</summary>
          <form onSubmit={sendEmail}>
            <Field label="Recipient" value={item.fields?.email || "No email available"} onChange={() => {}}><input value={item.fields?.email || "No email available"} readOnly /></Field>
            <Field label="Subject" value={subject} onChange={setSubject} required />
            <Field label="Message" rows={6} value={message} onChange={setMessage} required help="The email is sent from the configured Unity & Hope mailbox. Replies go to the business inbox." />
            <button className="admin-primary-button" disabled={busy || !item.fields?.email}><Icon name="Send" size={17} /> Send Email</button>
          </form>
        </details>
        <section className="admin-activity" aria-labelledby={`activity-${item.id}`}>
          <h3 id={`activity-${item.id}`}>Activity</h3>
          {item.activity?.length ? <ol>{[...item.activity].reverse().map((entry, index) => <li key={`${entry.createdAt}-${index}`}><Icon name="History" size={17} /><span><b>{String(entry.type || "updated").replaceAll("-", " ")}</b>{entry.detail && <small>{entry.detail}</small>}<small>{new Date(entry.createdAt).toLocaleString()} · {entry.actor || "system"}</small></span></li>)}</ol> : <p className="admin-muted">No activity has been recorded yet.</p>}
        </section>
      </div>
    </details>
  );
}

function SubmissionsManager({ submissions, refresh, update, remove, sendEmail, busy, mode = "submissions" }) {
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [archiveFilter, setArchiveFilter] = useState("active");
  const [query, setQuery] = useState("");
  const applications = mode === "applications";
  const scoped = submissions.filter((item) => applications ? item.formType === "career" : item.formType !== "career");
  const visible = scoped.filter((item) => {
    const matchesType = applications || typeFilter === "all" || item.formType === typeFilter;
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesArchive = archiveFilter === "all" || (archiveFilter === "archived" ? item.archived : !item.archived);
    const haystack = `${JSON.stringify(item.fields || {})} ${item.notes || ""}`.toLowerCase();
    return matchesType && matchesStatus && matchesArchive && haystack.includes(query.trim().toLowerCase());
  });
  return (
    <>
      <div className="admin-page-heading"><div><p className="admin-eyebrow">Secure inbox</p><h1>{applications ? "Careers & Applications" : "Submissions"}</h1><p>{applications ? "Review applicants, access résumés securely and record every follow-up." : "Manage contact messages and care requests without mixing them with job applications."}</p></div><button className="admin-secondary-button" type="button" onClick={refresh} disabled={busy}><Icon name="RefreshCw" size={18} /> Refresh</button></div>
      <div className="admin-search-row">
        <label><span className="sr-only">Search {applications ? "applications" : "submissions"}</span><Icon name="Search" size={18} /><input type="search" placeholder="Search name, email, details or notes" value={query} onChange={(event) => setQuery(event.target.value)} /></label>
        <label><span className="sr-only">Filter status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="all">All statuses</option>{submissionStatusOptions.slice(0, 4).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
        <label><span className="sr-only">Filter archived records</span><select value={archiveFilter} onChange={(event) => setArchiveFilter(event.target.value)}><option value="active">Active only</option><option value="archived">Archived only</option><option value="all">Active and archived</option></select></label>
      </div>
      {!applications && <div className="admin-filter-row" role="group" aria-label="Filter submission type">{[["all", "All"], ["contact", "Contact"], ["request-care", "Care Requests"]].map(([value, label]) => <button type="button" className={typeFilter === value ? "active" : ""} onClick={() => setTypeFilter(value)} key={value}>{label}</button>)}</div>}
      <p className="admin-results-count" role="status">Showing {visible.length} of {scoped.length} {applications ? "applications" : "submissions"}</p>
      <div className="admin-collection">{visible.length ? visible.map((item) => <SubmissionCard item={item} busy={busy} onUpdate={update} onDelete={remove} onEmail={sendEmail} key={`${item.id}-${item.updatedAt}`} />) : <EmptyState text={`No matching ${applications ? "applications" : "submissions"}.`} />}</div>
    </>
  );
}

export default function AdminApp() {
  const [auth, setAuth] = useState({ checking: true, authenticated: false, csrf: "", email: "" });
  const [section, setSection] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);
  const [content, setContent] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState({ type: "", text: "" });
  const [loadState, setLoadState] = useState({ content: "idle", dashboard: "idle", reviews: "idle", submissions: "idle" });

  useEffect(() => {
    document.title = "Unity & Hope Owner Portal";
    let robots = document.head.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, nofollow, noarchive";
  }, []);

  const signedOut = useCallback(() => setAuth({ checking: false, authenticated: false, csrf: "", email: "" }), []);
  const run = useCallback(async (task, success) => {
    setBusy(true); setNotice({ type: "", text: "" });
    try { const result = await task(); if (success) setNotice({ type: "success", text: success }); return result; }
    catch (error) { if (error.status === 401) signedOut(); else setNotice({ type: "error", text: error.message }); return null; }
    finally { setBusy(false); }
  }, [signedOut]);

  useEffect(() => {
    api("/api/admin-auth").then((result) => setAuth({ checking: false, ...result })).catch(signedOut);
  }, [signedOut]);

  const loadContent = useCallback(async () => {
    setLoadState((current) => ({ ...current, content: "loading" }));
    const result = await run(() => api("/api/admin?section=content"));
    if (result) setContent(result.content);
    setLoadState((current) => ({ ...current, content: result ? "ready" : "error" }));
  }, [run]);
  const loadDashboard = useCallback(async () => {
    setLoadState((current) => ({ ...current, dashboard: "loading" }));
    const result = await run(() => api("/api/admin?section=dashboard"));
    if (result) setDashboard(result);
    setLoadState((current) => ({ ...current, dashboard: result ? "ready" : "error" }));
  }, [run]);
  const loadReviews = useCallback(async () => {
    setLoadState((current) => ({ ...current, reviews: "loading" }));
    const result = await run(() => api("/api/admin?section=reviews"));
    if (result) setReviews(result.reviews || []);
    setLoadState((current) => ({ ...current, reviews: result ? "ready" : "error" }));
  }, [run]);
  const loadSubmissions = useCallback(async () => {
    setLoadState((current) => ({ ...current, submissions: "loading" }));
    const result = await run(() => api("/api/admin?section=submissions"));
    if (result) setSubmissions(result.submissions || []);
    setLoadState((current) => ({ ...current, submissions: result ? "ready" : "error" }));
  }, [run]);

  useEffect(() => {
    if (!auth.authenticated) return;
    void Promise.resolve().then(() => {
      if (!content) loadContent();
      if (section === "dashboard") loadDashboard();
      if (section === "reviews") loadReviews();
      if (section === "submissions" || section === "applications") loadSubmissions();
    });
  }, [auth.authenticated, content, loadContent, loadDashboard, loadReviews, loadSubmissions, section]);

  const saveSection = async (contentSection, explicitValue) => run(async () => {
    const result = await api("/api/admin?section=content", { method: "PUT", csrf: auth.csrf, body: JSON.stringify({ contentSection, value: explicitValue ?? content[contentSection] }) });
    setContent(result.content);
  }, "Changes saved and published.");

  const moderateReview = (id, action) => run(async () => {
    await api("/api/admin?section=reviews", { method: action === "delete" ? "DELETE" : "PUT", csrf: auth.csrf, body: JSON.stringify({ id, action }) });
    await loadReviews();
  }, action === "delete" ? "Review deleted." : "Review updated.");

  const updateSubmission = (id, changes) => run(async () => {
    const result = await api("/api/admin?section=submissions", { method: "PUT", csrf: auth.csrf, body: JSON.stringify({ id, ...changes }) });
    setSubmissions((current) => current.map((item) => item.id === id ? result.submission : item));
    return result;
  }, "Submission updated.");

  const deleteSubmission = (id) => run(async () => {
    const result = await api("/api/admin?section=submissions", { method: "DELETE", csrf: auth.csrf, body: JSON.stringify({ id }) });
    setSubmissions((current) => current.filter((item) => item.id !== id));
    return result;
  }, "Submission deleted.");

  const emailSubmission = (id, subject, message) => run(async () => {
    const result = await api("/api/admin?section=submissions", { method: "POST", csrf: auth.csrf, body: JSON.stringify({ action: "send-email", id, subject, message }) });
    setSubmissions((current) => current.map((item) => item.id === id ? result.submission : item));
    return result;
  }, "Email sent and activity recorded.");

  const logout = () => run(async () => {
    await api("/api/admin-auth", { method: "POST", csrf: auth.csrf, body: JSON.stringify({ action: "logout" }) });
    signedOut();
  });

  const navigate = (value) => { setSection(value); setMenuOpen(false); setNotice({ type: "", text: "" }); window.scrollTo(0, 0); };
  const page = (() => {
    if (section === "dashboard" && loadState.dashboard !== "ready") return <LoadState state={loadState.dashboard} label="your dashboard" retry={loadDashboard} />;
    if (section === "reviews" && loadState.reviews !== "ready") return <LoadState state={loadState.reviews} label="reviews" retry={loadReviews} />;
    if ((section === "submissions" || section === "applications") && loadState.submissions !== "ready") return <LoadState state={loadState.submissions} label={section === "applications" ? "applications" : "submissions"} retry={loadSubmissions} />;
    if (!content && !["dashboard", "reviews", "submissions", "applications"].includes(section)) return <LoadState state={loadState.content} label="website content" retry={loadContent} />;
    if (section === "dashboard") return <Dashboard data={dashboard} onNavigate={navigate} />;
    if (section === "website") return <WebsiteEditor content={content} setContent={setContent} save={saveSection} saving={busy} />;
    if (section === "services") return <CollectionEditor type="services" items={content.services} setItems={(updater) => setContent((current) => ({ ...current, services: typeof updater === "function" ? updater(current.services) : updater }))} save={() => saveSection("services")} saving={busy} csrf={auth.csrf} />;
    if (section === "areas") return <CollectionEditor type="areas" items={content.serviceAreas} setItems={(updater) => setContent((current) => ({ ...current, serviceAreas: typeof updater === "function" ? updater(current.serviceAreas) : updater }))} save={() => saveSection("serviceAreas")} saving={busy} csrf={auth.csrf} />;
    if (section === "team") return <CollectionEditor type="team" items={content.team || []} setItems={(updater) => setContent((current) => ({ ...current, team: typeof updater === "function" ? updater(current.team || []) : updater }))} save={() => saveSection("team")} saving={busy} csrf={auth.csrf} />;
    if (section === "reviews") return <ReviewsManager reviews={reviews} refresh={loadReviews} mutate={moderateReview} busy={busy} />;
    if (section === "resources") return <ResourcesEditor items={content.resources} setItems={(updater) => setContent((current) => ({ ...current, resources: typeof updater === "function" ? updater(current.resources) : updater }))} save={() => saveSection("resources")} saving={busy} csrf={auth.csrf} />;
    if (section === "seo") return <SeoEditor seo={content.seo} setSeo={(updater) => setContent((current) => ({ ...current, seo: typeof updater === "function" ? updater(current.seo) : updater }))} save={() => saveSection("seo")} saving={busy} />;
    if (section === "applications") return <SubmissionsManager mode="applications" submissions={submissions} refresh={loadSubmissions} update={updateSubmission} remove={deleteSubmission} sendEmail={emailSubmission} busy={busy} />;
    return <SubmissionsManager submissions={submissions} refresh={loadSubmissions} update={updateSubmission} remove={deleteSubmission} sendEmail={emailSubmission} busy={busy} />;
  })();

  if (auth.checking) return <main className="admin-auth-shell"><div className="admin-loading">Checking secure session…</div></main>;
  if (!auth.authenticated) return <AuthScreen onAuthenticated={(result) => setAuth({ checking: false, ...result })} />;

  return (
    <div className="admin-shell">
      <a className="skip-link" href="#admin-main">Skip to main content</a>
      <aside className={`admin-sidebar ${menuOpen ? "is-open" : ""}`} id="admin-sidebar">
        <div className="admin-brand"><img src="/brand/unity-hope-mark.webp" alt="" width="48" height="48" /><span><strong>Unity &amp; Hope</strong><small>Owner Portal</small></span></div>
        <nav aria-label="Admin navigation">{NAV_ITEMS.map(([value, icon, label]) => <button className={section === value ? "active" : ""} aria-current={section === value ? "page" : undefined} key={value} onClick={() => navigate(value)}><Icon name={icon} size={20} /> {label}</button>)}</nav>
        <div className="admin-sidebar-footer"><small>Signed in as<br />{auth.email}</small><button onClick={logout}><Icon name="LogOut" size={18} /> Sign Out</button></div>
      </aside>
      <header className="admin-mobile-header"><button type="button" aria-label={menuOpen ? "Close owner portal navigation" : "Open owner portal navigation"} aria-expanded={menuOpen} aria-controls="admin-sidebar" onClick={() => setMenuOpen((open) => !open)}><Icon name={menuOpen ? "X" : "Menu"} size={24} /></button><strong>Unity &amp; Hope</strong><a href="https://uhhomehealth.com" aria-label="Open public website"><Icon name="ExternalLink" size={21} /></a></header>
      {menuOpen && <button className="admin-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}
      <main className="admin-main" id="admin-main">
        {notice.text && <div className={`admin-toast admin-toast-${notice.type}`} role={notice.type === "error" ? "alert" : "status"}>{notice.text}<button aria-label="Dismiss message" onClick={() => setNotice({ type: "", text: "" })}><Icon name="X" size={18} /></button></div>}
        {page}
      </main>
    </div>
  );
}
