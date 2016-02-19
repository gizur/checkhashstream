Start the server: `node test_server.js`

Do a request where an aswer is expected: 
`curl -i -d "hi there" -H "If-None-Match:fd33e2e8ad3cb1bdd3ea8f5633fcf5c77" http://localhost:3000/hi`

Do a request where a 304 (Not modified) is expected: 
`curl -i -d "hi there" -H "If-None-Match:fd33e2e8ad3cb1bdd3ea8f5633fcf5c7" http://localhost:3000/hi`

