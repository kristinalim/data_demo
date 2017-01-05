module Pdfs
  class AttendanceLetter < Base
    attr_accessor :attendance

    def initialize(attendance, pdf_options)
      self.attendance = attendance

      super(pdf_options)
    end

    def render
      WickedPdf.new.pdf_from_string(
        context.render_to_string('pdfs/attendance_letter/main')
      )
    end
  end
end
