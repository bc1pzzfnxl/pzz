import llms from "../llms.txt";

export default {
  async fetch(request: Request): Promise<Response> {
    const { pathname } = new URL(request.url);

    if (pathname === "/" || pathname === "/llms.txt") {
      return new Response(llms, {
        headers: {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "public, max-age=300",
        },
      });
    }

    return new Response("Not found\n", { status: 404 });
  },
} satisfies ExportedHandler;
