import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

async function main() {
  const baseUrl = process.env.MCP_TEST_URL ?? 'http://127.0.0.1:3333/mcp';
  const client = new Client({ name: 'task-radar-mcp-tester', version: '0.3.0' });
  const transport = new StreamableHTTPClientTransport(new URL(baseUrl));

  await client.connect(transport);

  const tools = await client.listTools();
  console.log('Available tools:', tools.tools.map((tool) => tool.name));

  const result = await client.callTool({
    name: 'list_tasks',
    arguments: { status: 'pending' },
  });

  console.log('list_tasks result:', JSON.stringify(result, null, 2));
  await client.close();
}

main().catch((error) => {
  console.error('MCP test failed:', error);
  process.exit(1);
});
