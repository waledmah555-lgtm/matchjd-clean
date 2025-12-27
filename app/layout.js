export const metadata = {
  title: "JDMATCH",
  description: "Tailor your resume to any job description"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#f7f7f8",
          color: "#111"
        }}
      >
        {children}
      </body>
    </html>
  );
}
