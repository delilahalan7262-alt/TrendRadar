import { randomUUID } from 'node:crypto';
import { createServer } from 'node:http';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';
import { createTaskMcpServer } from '@/mcp/create-server';

type RequestWithBody = IncomingMessage & { body?: unknown };

type TransportMap = Record<string, StreamableHTTPServerTransport>;

const HOST = process.env.MCP_HOST ?? '127.0.0.1';
const PORT = Number(process.env.MCP_PORT ?? 3333);
const PATHNAME = process.env.MCP_PATH ?? '/mcp';
const transports: TransportMap = {};

function writeJson(res: ServerResponse, statusCode: number, payload: unknown) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readJsonBody(req: IncomingMessage) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length === 0) return undefined;
  const raw = Buffer.concat(chunks).toString('utf8');
  if (!raw) return undefined;
  return JSON.parse(raw);
}

async function handlePost(req: RequestWithBody, res: ServerResponse) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;

  try {
    req.body = await readJsonBody(req);

    let transport: StreamableHTTPServerTransport;
    if (sessionId && transports[sessionId]) {
      transport = transports[sessionId];
    } else if (!sessionId && req.body && isInitializeRequest(req.body)) {
      transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: () => randomUUID(),
        onsessioninitialized: (newSessionId) => {
          transports[newSessionId] = transport;
          console.info('[mcp] session initialized', { sessionId: newSessionId });
        },
      });

      transport.onclose = () => {
        if (transport.sessionId && transports[transport.sessionId]) {
          delete transports[transport.sessionId];
          console.info('[mcp] session closed', { sessionId: transport.sessionId });
        }
      };

      const server = createTaskMcpServer();
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      return;
    } else {
      writeJson(res, 400, {
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Bad Request: No valid MCP session or initialize request provided' },
        id: null,
      });
      return;
    }

    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error('[mcp] POST error', error);
    if (!res.headersSent) {
      writeJson(res, 500, {
        jsonrpc: '2.0',
        error: { code: -32603, message: error instanceof Error ? error.message : 'Internal MCP server error' },
        id: null,
      });
    }
  }
}

async function handleGet(req: IncomingMessage, res: ServerResponse) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    writeJson(res, 400, { error: 'Invalid or missing mcp-session-id header' });
    return;
  }

  try {
    await transports[sessionId].handleRequest(req, res);
  } catch (error) {
    console.error('[mcp] GET error', error);
    if (!res.headersSent) {
      writeJson(res, 500, { error: 'Unable to establish MCP SSE stream' });
    }
  }
}

async function handleDelete(req: IncomingMessage, res: ServerResponse) {
  const sessionId = req.headers['mcp-session-id'] as string | undefined;
  if (!sessionId || !transports[sessionId]) {
    writeJson(res, 400, { error: 'Invalid or missing mcp-session-id header' });
    return;
  }

  try {
    await transports[sessionId].handleRequest(req, res);
  } catch (error) {
    console.error('[mcp] DELETE error', error);
    if (!res.headersSent) {
      writeJson(res, 500, { error: 'Unable to terminate MCP session' });
    }
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? `${HOST}:${PORT}`}`);

  if (url.pathname === '/') {
    writeJson(res, 200, {
      name: 'task-radar-mcp',
      endpoint: PATHNAME,
      health: 'ok',
      message: 'Use POST/GET/DELETE on /mcp for MCP Streamable HTTP transport.',
    });
    return;
  }

  if (url.pathname !== PATHNAME) {
    writeJson(res, 404, { error: 'Not found' });
    return;
  }

  if (req.method === 'POST') {
    await handlePost(req as RequestWithBody, res);
    return;
  }
  if (req.method === 'GET') {
    await handleGet(req, res);
    return;
  }
  if (req.method === 'DELETE') {
    await handleDelete(req, res);
    return;
  }

  writeJson(res, 405, { error: `Method ${req.method} not allowed` });
});

server.listen(PORT, HOST, () => {
  console.info(`[mcp] Task Radar MCP server listening at http://${HOST}:${PORT}${PATHNAME}`);
});

process.on('SIGINT', async () => {
  console.info('[mcp] shutting down');
  await Promise.all(
    Object.values(transports).map(async (transport) => {
      try {
        await transport.close();
      } catch (error) {
        console.error('[mcp] transport close error', error);
      }
    }),
  );
  server.close();
  process.exit(0);
});
