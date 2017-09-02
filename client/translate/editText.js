import {Texts} from "../../lib/collection"
import {Session} from "meteor/session"
import {textKeys} from "../../lib/collection"


Template.editText.onRendered(function() {
  const languageCode = Template.currentData()
  const translateFromLanguage = 'en'
  const translateToLanguage = languageCode

  textKeys.forEach((textKey) => {
    console.log("translateFromLanguage", translateFromLanguage)
    console.log("translateToLanguage", translateToLanguage)
    Meteor.call('googleTranslate', textKey, translateFromLanguage, translateToLanguage, function(err, translatedText) {
      if (err) {
        translatedText = "N/A"
      }
      Session.set("googleTranslation-" + textKey + "-" + translateFromLanguage + "-" + translateToLanguage, translatedText)
    })
  })
})

function getEnglishText(textKey) {
  const text = Texts.findOne({languageName: "English"})
  return text[textKey]
}

Template.editText.helpers({
  languageName() {
    const languageCode = this
    return ISOLanguages.getName(languageCode)
  },

  textKeys() {
    return textKeys
  },

  rows() {
    const englishText = getEnglishText(this)
    return englishText.length / 20
  },

  englishText() {
    return getEnglishText(this)
  },
  
  googleTranslation() {
    const textKey = this
    const languageCode = Template.parentData()
    return Session.get("googleTranslation-" + textKey + "-en-" + languageCode)
  },

  translation() {
    const textKey = this
    const languageCode = Template.parentData()
    const preview = Session.get("preview")
    if (preview) {
      return preview[textKey]
    }

    const text = Texts.findOne({languageCode: languageCode})
    if (text) {
      return text[textKey]
    }
  }
})

function getTranslationDoc() {
  const languageCode = Template.currentData()

  const translation = {}
  textKeys.forEach((textKey) => {
    translation[textKey] = $(`[data-textkey=${textKey}]`).val()
  })
  translation.languageCode = languageCode
  translation.languageName = ISOLanguages.getName(languageCode)
  return translation
}

function saveTranslation(callback) {
  const translation = getTranslationDoc()
  Meteor.call('saveTranslation', translation, callback)
}


Template.editText.events({
  "click .previewButton"() {
    saveTranslation(function(err) {
      Router.go("/preview/" + languageCode)
    })
  },

  "click .reviewButton"() {
    saveTranslation(function(err) {
      Router.go("/reviewText/" + languageCode)
    })
  },

  "click .approveButton"() {
    const languageCode = Template.currentData()
    saveTranslation(function(err) {
      if (err) {
        console.log("Failed to save translation", err)
        return
      }

      Meteor.call("approveTranslation", languageCode, function(err) {
        if (err) {
          console.log("Failed to approve", err)
          return
        }
        Router.go("/admin")
      })
      Router.go("/reviewText/" + languageCode)
    })
  }
  
  
  
})