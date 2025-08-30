"use client"

export default function HomePage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3e8ff 0%, #fed7aa 50%, #fce7f3 100%)",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "24px",
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "linear-gradient(45deg, #9333ea, #ec4899)",
              borderRadius: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: "20px",
            }}
          >
            🎵
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              background: "linear-gradient(45deg, #9333ea, #ec4899)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              margin: 0,
            }}
          >
            Could that be it?
          </h1>
        </div>
        {/* <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ThemeToggle />
          <UserMenu />
        </div> */}
      </header>

      {/* Main Content */}
      <main
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "48px 24px",
          textAlign: "center",
        }}
      >
        <div style={{ marginBottom: "48px" }}>
          <h2
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#1f2937",
              lineHeight: "1.2",
              marginBottom: "16px",
            }}
          >
            Share Your{" "}
            <span
              style={{
                background: "linear-gradient(45deg, #9333ea, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Musical Magic
            </span>
          </h2>
          <p
            style={{
              fontSize: "20px",
              color: "#6b7280",
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Upload your guitar riffs, get feedback from fellow musicians, and discover amazing sounds from the
            community.
          </p>
        </div>

        {/* Upload Section */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.8)",
            borderRadius: "16px",
            border: "2px solid #e5e7eb",
            padding: "48px",
            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            marginBottom: "48px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              marginBottom: "16px",
            }}
          >
            <span style={{ fontSize: "24px" }}>✨</span>
            <h3
              style={{
                fontSize: "24px",
                fontWeight: "600",
                color: "#1f2937",
                margin: 0,
              }}
            >
              Upload New Riff Here
            </h3>
            <span style={{ fontSize: "24px" }}>✨</span>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <div style={{ fontSize: "32px", animation: "bounce 1s infinite" }}>⬇️</div>
          </div>

          {/* {user ? (
            <UploadDropzone />
          ) : ( */}
          <div
            style={{
              border: "2px dashed #d1d5db",
              borderRadius: "12px",
              padding: "48px",
              background: "linear-gradient(135deg, #f3e8ff, #fce7f3)",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  background: "linear-gradient(45deg, #9333ea, #ec4899)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                  fontSize: "32px",
                }}
              >
                🎸
              </div>
              <div>
                <p
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: "#1f2937",
                    marginBottom: "8px",
                  }}
                >
                  Coming Soon: Upload Your Riffs
                </p>
                <p
                  style={{
                    color: "#6b7280",
                    margin: 0,
                  }}
                >
                  We're building an amazing platform for musicians to share and discover music
                </p>
              </div>
            </div>
          </div>
          {/* )} */}
        </div>

        {/* Community Link */}
        <div>
          <div
            style={{
              display: "inline-block",
              background: "linear-gradient(45deg, #f97316, #ef4444)",
              color: "white",
              fontWeight: "600",
              padding: "12px 32px",
              fontSize: "18px",
              borderRadius: "8px",
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            🎵 Explore Community Riffs (Coming Soon)
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes bounce {
          0%, 20%, 53%, 80%, 100% {
            transform: translate3d(0,0,0);
          }
          40%, 43% {
            transform: translate3d(0,-30px,0);
          }
          70% {
            transform: translate3d(0,-15px,0);
          }
          90% {
            transform: translate3d(0,-4px,0);
          }
        }
      `}</style>
    </div>
  )
}
