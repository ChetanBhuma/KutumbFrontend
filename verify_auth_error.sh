#!/bin/bash
curl -v -X POST http://localhost:5000/api/v1/citizen-auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"mobileNumber": "9876543230"}'
