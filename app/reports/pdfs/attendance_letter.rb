module Pdfs
  class AttendanceLetter < Base
    attr_accessor :attendance

    def initialize(attendance, pdf_options)
      self.attendance = attendance

      # TODO: Remove this section if the real "attendance" value is being
      # passed.
      self.attendance = Object.new
      self.attendance.instance_eval do
        def first_name
          'Johnathan'
        end
      end

      super(pdf_options)
    end

    def render
      WickedPdf.new.pdf_from_string(
        context.render_to_string('pdfs/attendance_letter/main', {
          locals: {
            attendance: attendance,
            # TODO: Replace with intended values.
            letter_date: Time.zone.today,
            letter_date_format: '%B %d, %Y',
            letter_writer: 'Diane Dross',
            letter_writer_description: 'Principal - Phoenix Rising',
            school_name: 'Phoenix Rising',
            school_phone: '+0123456789'
          },
          layout: 'application'
        })
      )
    end
  end
end
