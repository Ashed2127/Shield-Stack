
# Shield-Stack
 ### for easy setup, for beginners.


 ## for simple/manual test.
 ### curl -X POST http://localhost:5000/submit \
 ###  -H "Content-Type: application/json" \
 ###  -d '{"username":"ab", "password":"short"}' \
 ###  -w "Status: %{http_code} | Time: %{time_total}s\n"


 ## for iterative test.
 ### for i in {1..10}; do
 ###  curl -X POST http://localhost:5000/submit \
 ###  -H "Content-Type: application/json" \
 ###  -d "{\"username\":\"user$i\", \"password\":\"testpass$i\"}" \
 ###  -w "Request $i: HTTP %{http_code} | Time: %{time_total}s\n"
 ### done
