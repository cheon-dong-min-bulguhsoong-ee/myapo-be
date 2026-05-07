# [Domain Name] API Specification

## 1. Overview
- **Base Path**: `/api/v1/[domain]`
- **Description**: Concise description of the domain's API surface and its primary responsibilities.

## 2. Authentication & Authorization
- **Auth Strategy**: (e.g., Bearer Token JWT)
- **Required Roles/Permissions**: (e.g., Admin, User, None)

## 3. Endpoints

### 3.1. [Operation Name] (e.g., Create User)
- **Method**: `[GET|POST|PUT|PATCH|DELETE]`
- **Path**: `/[endpoint_path]`
- **Description**: Detailed behavior of this endpoint.

#### API Contract (OpenAPI YAML)
```yaml
paths:
  /api/v1/[domain]/[endpoint_path]:
    [method]:
      summary: [Short summary]
      operationId: [operationName] # Directly maps to the Controller method name
      parameters:
        # Define Path, Query, or Header parameters here
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/[RequestDTO]'
      responses:
        '200':
          description: Success
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/[ResponseDTO]'
        '400':
          description: Bad Request (e.g., Validation Failure)
        '401':
          description: Unauthorized
        '403':
          description: Forbidden
```

## 4. Components (Schemas)
```yaml
components:
  schemas:
    [RequestDTO]:
      type: object
      required:
        - field1
      properties:
        field1:
          type: string
          description: Description of field1
    [ResponseDTO]:
      type: object
      properties:
        id:
          type: string
          description: Unique identifier
```
