export async function onRequest(context) {
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Dream Tarot Moon Crystal Garden</title>

  <!-- your OG -->
  <meta property="og:title" content="Dream Tarot Moon Crystal Garden" />
  <meta property="og:image" content="https://pixeldream-tarot.surf/og-cover.png" />
  <meta property="og:description" content="Step into a moonlit crystal garden..." />
  <meta property="og:type" content="website" />

  <link rel="icon" href="/icon.png" />
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/src/main.jsx"></script>
</body>
</html>`;

  return new Response(html, {
    headers: { "Content-Type": "text/html" }
  });
}
