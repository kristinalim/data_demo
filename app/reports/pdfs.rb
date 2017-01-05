module Pdfs
  class Base
    attr_accessor :context

    def initialize(pdf_options)
      self.context = pdf_options[:context]
    end

    # Override this in the subclasses. This method should return the generated
    # PDF file.
    def render
    end
  end
end
