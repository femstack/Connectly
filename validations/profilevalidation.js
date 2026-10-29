const joi = require("joi");

const updateProfileSchema = joi.object({
  firstname: joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "firstname is required",
    "string.min": "firstname must contain at least 3 character",
    "string.max": "firstname must exceed at least 30 character",
  }),
  lastname: joi.string().trim().min(3).max(30).required().messages({
    "string.empty": "firstname is required",
    "string.min": "firstname must contain at least 3 character",
    "string.max": "firstname must exceed at least 30 character",
  }),
  username: joi.string().trim().min(3).max(30),
  email: joi
    .string()
    .trim()
    .lowercase()
    .email({
      minDomainSegments: 2,
      tlds: { allow: true },
    })
    .not(null)
    .custom((value, helpers) => {
      const blockedDomains = [
        "example.com",
        "example.org",
        "example.net",
        "test.com",
        "mailinator.com",
      ];

      const domain = value.split("@")[1];

      if (blockedDomains.includes(domain)) {
        return helpers.error("email.disposable");
      }

      return value;
    })
    .required()
    .messages({
      "string.empty": "Email address is required",
      "string.email": "Please enter a valid email address",
      "any.required": "Email address is required",
      "email.disposable":
        "Please use a real email address, not a placeholder or temporary email",
    }),

  bio: joi.string().trim().allow("").max(300),
  location: joi.string().trim().allow("").max(100),
  website: joi.string().trim().allow("").max(100),

  dob: joi
    .string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .custom((value, helpers) => {
      const dob = new Date(`${value}T00:00:00.000Z`);

      // Check that the date is real
      if (
        Number.isNaN(dob.getTime()) ||
        dob.toISOString().slice(0, 10) !== value
      ) {
        return helpers.error("date.invalid");
      }

      // Calculate the date 18 years ago
      const today = new Date();
      const cutoff = new Date(
        Date.UTC(
          today.getUTCFullYear() - 18,
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      );

      // Reject users younger than 18
      if (dob > cutoff) {
        return helpers.error("date.minAge");
      }

      return value;
    })
    .required()
    .messages({
      "string.pattern.base": "DOB must be in YYYY-MM-DD format",
      "date.invalid": "Please enter a valid date of birth",
      "date.minAge": "You must be at least 18 years old to use Connectly",
      "any.required": "Date of birth is required",
      "string.empty": "Date of birth is required",
    }),

  gender: joi.string().valid("male", "female"),
  twitter: joi.string().trim().allow("").max(100),
  linkedin: joi.string().trim().allow("").max(100),
  instagram: joi.string().trim().allow("").max(100),
});

const passwordRules = joi
  .string()
  .min(8)
  .max(20)
  .pattern(/[A-Z]/)
  .pattern(/[a-z]/)
  .pattern(/[0-9]/)
  .pattern(/[^A-Za-z0-9]/)
  .required()
  .messages({
    "string.min": "Password must be at least 8 characters long.",
    "string.max": "Password cannot exceed 20 characters.",
    "string.pattern.base":
      "Password must contain an uppercase letter, lowercase letter, number, and special symbol.",
    "string.empty": "Password is required.",
    "any.required": "Password is required.",
  });

const changePasswordSchema = joi.object({
  currentPassword: joi.string().required().messages({
    "string.empty": "Current password is required.",
    "any.required": "Current password is required.",
  }),

  newPassword: passwordRules,

  confirmNewPassword: joi
    .string()
    .valid(joi.ref("newPassword"))
    .required()
    .messages({
      "any.only": "Confirm password must match the new password.",
      "string.empty": "Confirm password is required.",
      "any.required": "Confirm password is required.",
    }),
});

module.exports = { updateProfileSchema, changePasswordSchema };
