import { Link } from "react-router-dom";
import { Icon } from "./Icon";

export function Button({ children, to, href, variant = "primary", icon, className = "", ...props }) {
  const classes = `button button-${variant} ${className}`.trim();
  const content = (
    <>
      {icon && <Icon name={icon} size={20} />}
      <span>{children}</span>
      {variant !== "icon" && !icon && <Icon name="ArrowRight" size={18} />}
    </>
  );

  if (to) {
    return (
      <Link className={classes} to={to} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a className={classes} href={href} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...props}>
      {content}
    </button>
  );
}

