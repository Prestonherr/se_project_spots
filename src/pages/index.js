import "./index.css";
import {
  enableValidation,
  settings,
  resetValidation,
  disableButton,
} from "../scripts/validation.js";

import { setButtonText } from "../utils/helpers.js";

import pencilLightIcon from "../images/pencil-light.svg";
import logoSrc from "../images/logo.svg";
import avatarSrc from "../images/avatar.jpg";
import pencilIcon from "../images/pencil.svg";
import plusIcon from "../images/plus.svg";

const avatarElement = document.getElementById("avatar");
avatarElement.src = avatarSrc;
const logoElement = document.getElementById("logo");
logoElement.src = logoSrc;

document.getElementById("pencil-icon").src = pencilIcon;
document.getElementById("plus-icon").src = plusIcon;
document.getElementById("profile__pencil-light").src = pencilLightIcon;

import Api from "../utils/Api.js";

const api = new Api({
  baseUrl: "https://around-api.en.tripleten-services.com/v1",
  headers: {
    authorization: "0f6138b5-8fc9-4c68-90b7-4fd691cce345",
    "Content-Type": "application/json",
  },
});

api
  .getAppInfo()
  .then(([userData, cards]) => {
    avatarElement.src = userData.avatar;
    profileName.textContent = userData.name;
    profileDescription.textContent = userData.about;

    cards.forEach((card) => {
      const cardElement = getCardElement(card);
      cardsList.append(cardElement);
    });
  })
  .catch(console.error);

// Modal Selection
const previewModal = document.querySelector("#preview-modal");
const previewModalImageEl = previewModal.querySelector(".modal__image");
const previewModalCaptionEl = previewModal.querySelector(".modal__caption");
const previewModalCloseButton = previewModal.querySelector(
  ".modal__close-button"
);

// Profile elements
const profileEditButton = document.querySelector(".profile__edit-button");
const newPostButton = document.querySelector(".profile__add-button");
const profileName = document.querySelector(".profile__name");
const profileDescription = document.querySelector(".profile__description");
const avatarModalBtn = document.querySelector(".profile__avatar-btn");

// Form elements
const editProfileModal = document.querySelector("#edit-profile-modal");
const editFormElement = editProfileModal.querySelector(".modal__form");
const editCloseButton = editProfileModal.querySelector(".modal__close-button");
const editModalNameInput = editProfileModal.querySelector(
  "#profile-name-input"
);
const editModalDescriptionInput = editProfileModal.querySelector(
  "#profile-description-input"
);
const editProfileSubmitBtn = editProfileModal.querySelector(
  ".modal__submit-button"
);

// Avatar form elements
const avatarModal = document.querySelector("#avatar-modal");
const avatarForm = avatarModal.querySelector(".modal__form");
const avatarSubmitBtn = avatarModal.querySelector(".modal__submit-button");
const avatarModalCloseBtn = avatarModal.querySelector(".modal__close-button");
const avatarInput = avatarModal.querySelector("#profile-avatar-input");

// Delete form elements
const deleteModal = document.querySelector("#delete-modal");
const deleteForm = deleteModal.querySelector(".modal__form");
const deleteFormCloseBtn = deleteModal.querySelector(".modal__close-button");
const deleteCancelButton = document.getElementById("delete-cancel-btn");

// Card elements
const cardModal = document.querySelector("#add-card-modal");
const cardModalCloseButton = cardModal.querySelector(".modal__close-button");
const addCardFormElement = cardModal.querySelector(".modal__form");
const addCardSubmitBtn = cardModal.querySelector(".modal__submit-button");
const addCardNameInput = cardModal.querySelector("#add-card-name-input");
const addCardLinkInput = cardModal.querySelector("#add-card-link-input");
const cardTemplate = document.querySelector("#card-template");
const cardsList = document.querySelector(".cards__list");

let selectedCard, selectedCardId;

function getCardElement(data) {
  const cardElement = cardTemplate.content
    .querySelector(".card")
    .cloneNode(true);

  const cardNameEl = cardElement.querySelector(".card__title");
  const cardImageEl = cardElement.querySelector(".card__image");
  const cardLikeButton = cardElement.querySelector(".card__like-button");
  const cardDeleteButton = cardElement.querySelector(".card__delete-button");

  cardNameEl.textContent = data.name;
  cardImageEl.src = data.link;
  cardImageEl.alt = data.name;

  cardImageEl.addEventListener("click", () => {
    openModal(previewModal);
    previewModalImageEl.src = data.link;
    previewModalImageEl.alt = data.name;
    previewModalCaptionEl.textContent = data.name;
  });

  if (data.isLiked) {
    cardLikeButton.classList.add("card__like-button_liked");
  } else {
    cardLikeButton.classList.remove("card__like-button_liked");
  }

  cardLikeButton.addEventListener("click", () => {
    const isLiked = cardLikeButton.classList.contains(
      "card__like-button_liked"
    );

    api
      .changeLikeStatus(data._id, isLiked)
      .then((updatedCard) => {
        if (updatedCard.isLiked) {
          cardLikeButton.classList.add("card__like-button_liked");
        } else {
          cardLikeButton.classList.remove("card__like-button_liked");
        }
      })
      .catch(console.error);
  });

  cardDeleteButton.addEventListener("click", () => {
    selectedCard = cardElement;
    selectedCardId = data._id;
    openModal(deleteModal);
  });

  return cardElement;
}

function handleDeleteSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Delete", "Deleting...");

  api
    .deleteCard(selectedCardId)
    .then(() => {
      selectedCard.remove();
      closeModal(deleteModal);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Delete", "Deleting...");
    });
}

deleteForm.addEventListener("submit", handleDeleteSubmit);

function openModal(modal) {
  modal.classList.add("modal_opened");
  document.addEventListener("keydown", handleEscapeKey);
}

function closeModal(modal) {
  modal.classList.remove("modal_opened");
  document.removeEventListener("keydown", handleEscapeKey);
}

function handleEditFormSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api
    .editUserInfo({
      name: editModalNameInput.value,
      about: editModalDescriptionInput.value,
    })
    .then((data) => {
      profileName.textContent = data.name;
      profileDescription.textContent = data.about;
      closeModal(editProfileModal);
      disableButton(editProfileSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleAddCardSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  const cardData = {
    name: addCardNameInput.value,
    link: addCardLinkInput.value,
  };

  api
    .postNewCard(cardData)
    .then((newCard) => {
      const cardElement = getCardElement(newCard);
      cardsList.prepend(cardElement);
      closeModal(cardModal);
      addCardFormElement.reset();
      disableButton(addCardSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

function handleAvatarSubmit(evt) {
  evt.preventDefault();

  const submitBtn = evt.submitter;
  setButtonText(submitBtn, true, "Save", "Saving...");

  api
    .editAvatarInfo(avatarInput.value)
    .then((data) => {
      avatarElement.src = data.avatar;
      closeModal(avatarModal);
      avatarForm.reset();
      disableButton(avatarSubmitBtn, settings);
    })
    .catch(console.error)
    .finally(() => {
      setButtonText(submitBtn, false, "Save", "Saving...");
    });
}

profileEditButton.addEventListener("click", () => {
  editModalDescriptionInput.value = profileDescription.textContent;
  editModalNameInput.value = profileName.textContent;
  resetValidation(
    editFormElement,
    [editModalDescriptionInput, editModalNameInput],
    settings
  );
  openModal(editProfileModal);
});

editCloseButton.addEventListener("click", () => {
  closeModal(editProfileModal);
});

newPostButton.addEventListener("click", () => {
  openModal(cardModal);
});

cardModalCloseButton.addEventListener("click", () => {
  closeModal(cardModal);
});

previewModalCloseButton.addEventListener("click", () => {
  closeModal(previewModal);
});

avatarModalBtn.addEventListener("click", () => {
  openModal(avatarModal);
});
avatarForm.addEventListener("submit", handleAvatarSubmit);

avatarModalCloseBtn.addEventListener("click", () => {
  closeModal(avatarModal);
});

deleteFormCloseBtn.addEventListener("click", () => {
  closeModal(deleteModal);
});

deleteCancelButton.addEventListener("click", () => {
  closeModal(deleteModal);
});

function handleOverlayClick(event) {
  if (event.target.classList.contains("modal_opened")) {
    closeModal(event.target);
  }
}

document.querySelectorAll(".modal").forEach((modal) => {
  modal.addEventListener("mousedown", handleOverlayClick);
});

function handleEscapeKey(event) {
  if (event.key === "Escape") {
    const openModal = document.querySelector(".modal_opened");
    if (openModal) {
      closeModal(openModal);
    }
  }
}

editFormElement.addEventListener("submit", handleEditFormSubmit);
addCardFormElement.addEventListener("submit", handleAddCardSubmit);

enableValidation(settings);
