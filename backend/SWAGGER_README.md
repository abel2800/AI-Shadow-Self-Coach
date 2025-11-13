# Swagger/OpenAPI Documentation

Interactive API documentation for the Shadow Coach API.

## Access Documentation

### Swagger UI
```
http://localhost:3000/api-docs
```

### JSON Specification
```
http://localhost:3000/api-docs/json
```

## Features

- ✅ **Interactive API Explorer** - Test endpoints directly from browser
- ✅ **Complete Endpoint Documentation** - All routes documented
- ✅ **Request/Response Schemas** - Full schema definitions
- ✅ **Authentication Support** - JWT token testing
- ✅ **Error Responses** - Documented error codes
- ✅ **Try It Out** - Execute requests from UI

## Documented Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Authenticate user
- `POST /api/v1/auth/refresh` - Refresh token

### Sessions
- `POST /api/v1/session/start` - Start new session
- `POST /api/v1/session/:id/message` - Send message
- `POST /api/v1/session/:id/pause` - Pause session
- `POST /api/v1/session/:id/resume` - Resume session
- `POST /api/v1/session/:id/end` - End session
- `GET /api/v1/session/:id/summary` - Get session summary
- `GET /api/v1/session` - List sessions

### Journal
- `GET /api/v1/journal/entries` - List journal entries
- `GET /api/v1/journal/entry/:session_id` - Get entry detail
- `POST /api/v1/journal/export` - Export entries
- `DELETE /api/v1/journal/entry/:session_id` - Delete entry

### Analytics
- `POST /api/v1/analytics/mood` - Submit mood score
- `GET /api/v1/analytics/mood` - Get mood history
- `GET /api/v1/analytics/insights` - Get insights
- `GET /api/v1/analytics/progress` - Get progress

### Safety
- `POST /api/v1/safety/check` - Check message safety
- `GET /api/v1/safety/resources` - Get crisis resources

### Vector Store
- `GET /api/v1/vectorstore/status` - Get vector store status
- `POST /api/v1/vectorstore/search` - Search context

### Health
- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check

## Using Swagger UI

### 1. Authenticate

1. Click "Authorize" button (top right)
2. Enter JWT token: `Bearer <your_token>`
3. Click "Authorize"
4. Token is now used for all authenticated requests

### 2. Test Endpoints

1. Find endpoint in list
2. Click "Try it out"
3. Fill in request parameters
4. Click "Execute"
5. View response

### 3. View Schemas

- Click on schema names to expand
- See all properties and types
- Understand request/response formats

## Adding Documentation

### For New Endpoints

Add JSDoc comments to route files:

```javascript
/**
 * @swagger
 * /endpoint/path:
 *   post:
 *     summary: Endpoint description
 *     tags: [TagName]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *     responses:
 *       200:
 *         description: Success response
 */
router.post('/path', controller.handler);
```

## Configuration

Swagger configuration is in:
- `backend/src/config/swagger.js` - Main configuration
- Route files - Endpoint documentation

## Customization

### Change UI Theme

Edit `backend/src/routes/swagger.routes.js`:

```javascript
router.get('/', swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Your API Title'
}));
```

### Add Examples

Add examples to schemas:

```javascript
properties:
  email:
    type: string
    format: email
    example: user@example.com
```

## Export OpenAPI Spec

### Get JSON Spec

```bash
curl http://localhost:3000/api-docs/json > openapi.json
```

### Use with Other Tools

- **Postman**: Import OpenAPI spec
- **Insomnia**: Import OpenAPI spec
- **Code Generation**: Generate client SDKs
- **API Testing**: Use with testing tools

## Best Practices

1. **Keep Documentation Updated** - Update when endpoints change
2. **Add Examples** - Include realistic examples
3. **Document Errors** - List all possible error responses
4. **Use Tags** - Organize endpoints by feature
5. **Describe Parameters** - Explain what each parameter does

## Troubleshooting

### Documentation Not Showing

- Check route file has JSDoc comments
- Verify swagger config includes route files
- Check server is running
- Clear browser cache

### Authentication Not Working

- Verify token format: `Bearer <token>`
- Check token is valid and not expired
- Ensure endpoint requires authentication

---

**API documentation is now available at `/api-docs`!** 📚

