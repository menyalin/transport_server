// @ts-nocheck
import { DocTemplateService } from '../services'

class DocTemplateController {
  constructor({ service }) {
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
