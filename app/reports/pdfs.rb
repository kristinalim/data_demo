module Pdfs
  class Base
    attr_accessor :context, :locale

    def initialize(pdf_options)
      self.context = pdf_options[:context]

      self.locale = pdf_options[:locale].to_s
      self.locale = I18n.default_locale if locale.blank?
    end

    # Override this in the subclasses. This method should return the generated
    # PDF file.
    def render
    end
  end
end
