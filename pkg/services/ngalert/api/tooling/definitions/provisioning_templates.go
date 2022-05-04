package definitions

import (
	"fmt"
	"regexp"
	"strings"
)

// swagger:route GET /api/provisioning/templates provisioning RouteGetTemplates
//
// Get all message templates.
//
//     Responses:
//       200: []MessageTemplate
//       400: ValidationError

// swagger:route GET /api/provisioning/templates/{ID} provisioning RouteGetTemplate
//
// Get a message template.
//
//     Responses:
//       200: MessageTemplate
//       404: NotFound

// swagger:route PUT /api/provisioning/templates/{ID} provisioning RoutePutTemplate
//
// Updates an existing template.
//
//     Consumes:
//     - application/json
//
//     Responses:
//       202: Accepted
//       400: ValidationError

// swagger:route DELETE /api/provisioning/templates/{ID} provisioning RouteDeleteTemplate
//
// Delete a template.
//
//     Responses:
//       204: Accepted

type MessageTemplate struct {
	Name     string
	Template string
}

type MessageTemplateContent struct {
	Template string
}

// swagger:parameters RoutePutTemplate
type MessageTemplatePayload struct {
	// in:body
	Body MessageTemplateContent
}

func (t *MessageTemplate) ResourceType() string {
	return "template"
}

func (t *MessageTemplate) ResourceID() string {
	return t.Name
}

func (t *MessageTemplate) Validate() error {
	if t.Name == "" {
		return fmt.Errorf("template must have a name")
	}
	if t.Template == "" {
		return fmt.Errorf("template must have content")
	}

	content := strings.TrimSpace(t.Template)
	found, err := regexp.MatchString(`\{\{\s*define`, content)
	if err != nil {
		return fmt.Errorf("failed to match regex: %w", err)
	}
	if !found {
		lines := strings.Split(content, "\n")
		for i, s := range lines {
			lines[i] = "  " + s
		}
		content = strings.Join(lines, "\n")
		content = fmt.Sprintf("{{ define \"%s\" }}\n%s\n{{ end }}", t.Name, content)
	}
	t.Template = content

	return nil
}
