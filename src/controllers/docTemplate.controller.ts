import { DocTemplateService } from '../services/index.js'

class DocTemplateController {
  constructor({ service, permissionName }) {
    this.service = service
  }

  async getAllowedTemplates(req, res) {
    try {
      const templates = await DocTemplateService.getAllowedTemplates(req.query)
      res.status(200).json(templates)
    } catch (e) {
      res.status(e.statusCode || 500).json(e.message)
    }
  }
}

export default new DocTemplateController({
  service: DocTemplateService,
})
