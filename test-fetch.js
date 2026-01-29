const http = require('http');

function check(port) {
  const options = {
    hostname: 'localhost',
    port: port,
    path: '/uploads/documents/Officer_Visit_Logic_1768383693327_e0c0710cce55fd85.pdf',
    method: 'HEAD'
  };

  const req = http.request(options, (res) => {
    console.log(`Port ${port} status: ${res.statusCode}`);
  });

  req.on('error', (e) => {
    console.error(`Port ${port} error: ${e.message}`);
  });

  req.end();
}

check(5000);
check(3000);
