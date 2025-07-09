import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

const TopNav = () => {
  const { user } = useUser();
  const isAdmin = user?.publicMetadata?.role === "admin";

  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0.75rem 1.5rem",
        borderBottom: "1px solid #27272a",
        background: "#18181b",
        minHeight: 56,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
        <Link href="/">
          <span style={{ fontWeight: 600, fontSize: 20, color: "#fff" }}>
            T3 Cloneathon
          </span>
        </Link>
        <div style={{ display: "flex", gap: "1rem" }}>
          <Link
            href="/register"
            style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}
          >
            Register
          </Link>
          <Link
            href="/gallery"
            style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}
          >
            Gallery
          </Link>
          {isAdmin && (
            <Link
              href="/judge"
              style={{ color: "#fff", textDecoration: "none", fontSize: 14 }}
            >
              Judge
            </Link>
          )}
        </div>
      </div>
      <UserButton
        appearance={{
          elements: { userButtonAvatarBox: { borderColor: "#fff" } },
        }}
      />
    </nav>
  );
};

export default TopNav;
