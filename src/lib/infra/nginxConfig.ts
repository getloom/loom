import {HEARTBEAT_INTERVAL} from '$lib/ui/socket.js';
import {render_ascii_loom_logo} from '$lib/util/logo.js';

// Outputs the sites nginx config with configured values.
export const render_nginx_site_config = (
	PUBLIC_DEPLOY_SERVER_HOST: string,
	production_server_host: string,
	REMOTE_NGINX_502_DIR: string,
): string => {
	return `

server {
  server_name ${PUBLIC_DEPLOY_SERVER_HOST};

  error_page 502 /502.html;
  location /502.html {
      root ${REMOTE_NGINX_502_DIR};
  }

  location / {
    proxy_pass http://${production_server_host};
  }

}

  `.trim();
};

// Outputs the apps nginx config with configured values.
export const render_nginx_app_config = (
	PUBLIC_DEPLOY_SERVER_HOST: string,
	production_server_host: string,
	REMOTE_NGINX_502_DIR: string,
): string => {
	const websocketTimeout = `${HEARTBEAT_INTERVAL / 1000 + 60}s`; // 60 second padding
	return `

server {
  server_name ${PUBLIC_DEPLOY_SERVER_HOST};

  location /api {
    proxy_pass http://${production_server_host};
  }

  location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://${production_server_host};
    proxy_read_timeout ${websocketTimeout};
    proxy_send_timeout ${websocketTimeout};
  }

  error_page 502 /502.html;
  location /502.html {
      root ${REMOTE_NGINX_502_DIR};
  }

  location / {
    proxy_pass http://${production_server_host};
  }

}

  `.trim();
};

// Outputs an simple html file for nginx to server during Loom downtime
export const render_502_html = (PUBLIC_ADMIN_EMAIL: string): string =>
	`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      .headers {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .heart {
        font-family: ui-monospace, monospace;
        text-align: center;
        font-size: 4px;
      }
    </style>
  </head>
  <body>
    <div class="headers">
      <h1>Loom is temporarily down</h1>
      <h2>If this page persists, please contact ${PUBLIC_ADMIN_EMAIL}</h2>
    </div>
    <pre class="heart">${render_ascii_loom_logo()}</pre>
  </body>
</html>
`.trim();
