# TODO: فعّل Give Feedback (rate mentorship)

- [ ] فهم API المطلوبة: `POST /api/v1/mentorship/{mentorshipId}/rate` بbody `{ rating: number, feedback: string }`
- [ ] إضافة service دالة لإرسال الـ rate request
- [ ] إضافة mutation في الصفحة `ReviewsSection.tsx` مع form/Modal بسيط للـ rating + feedback
- [ ] عند نجاح الطلب: اعرض `toast.success(message)` والـ toast message من response
- [ ] عند فشل الطلب: اعرض `toast.error(...)`
- [ ] عند النجاح: إعادة استدعاء reviews (invalidate query)
- [ ] التأكد من عدم وجود أخطاء TypeScript/ESLint
