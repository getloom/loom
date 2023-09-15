import {HEARTBEAT_INTERVAL} from '$lib/ui/socket';

// Outputs an nginx config with configured values.
export const toNginxConfig = (
	PUBLIC_DEPLOY_SERVER_HOST: string,
	API_SERVER_HOST_PROD: string,
	REMOTE_NGINX_502_DIR: string,
): string => {
	const websocketTimeout = `${HEARTBEAT_INTERVAL / 1000 + 60}s`; // 60 second padding
	return `

server {
  server_name ${PUBLIC_DEPLOY_SERVER_HOST};

  location /api {
    proxy_pass http://${API_SERVER_HOST_PROD};
  }

  location /ws {
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header Host $host;
    proxy_pass http://${API_SERVER_HOST_PROD};
    proxy_read_timeout ${websocketTimeout};
    proxy_send_timeout ${websocketTimeout};
  }

  error_page 502 /502.html;
  location /502.html {
      root ${REMOTE_NGINX_502_DIR};
  }

  location / {
    proxy_pass http://${API_SERVER_HOST_PROD};
  }

}

  `.trim();
};

// Outputs an simple html file for nginx to server during Felt downtime
export const to502File = (PUBLIC_ADMIN_EMAIL_ADDRESS: string): string => {
	return `
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
        <h1>Felt is temporarily down</h1>
        <h2>If this page persists, please contact ${PUBLIC_ADMIN_EMAIL_ADDRESS}</h2>
      </div>
      <pre class="heart">${toAsciiFeltLogo()}</pre>
    </body>
  </html>
  `.trim();
};

//TODO would this be fun to have in felt-util?
export const toAsciiFeltLogo = (): string => {
	return `
               ############                           ############              
          ######################                 ######################         
      #############################           ############################      
    ##################################     ##################################   
  #####################################  #####################################  
 ############################################################################## 
################################################################################
################################################################################
####################      ######################     ###########################
#################    ###########################    ########   #################
################     ##  ######   ###   ########    #####     ##  ##############
################    ## ######    ######   #####     ######    # ################
 ###############    #########    ###    #######    ######    ###################
  ##############    #########    ##############    ######    ################## 
   ############     ############     #########     ########      #############  
    ########################################################################    
      ####################################################################      
        ################################################################        
          ############################################################          
             ######################################################             
                ################################################                
                   ##########################################                   
                      #####################################                     
                        ################################                        
                           ##########################                           
                              #####################                             
                                ################                                
                                  ############                                  
                                    ########                                    
                                      ####                                      
                                       ##
                                      `;
};
