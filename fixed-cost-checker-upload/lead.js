document.querySelectorAll(".lead-form").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = form.querySelector(".form-message");
    if (message) {
      message.textContent = "仮受付が完了しました。本番ではここで送信・決済・LINE連携に接続します。";
    }
  });
});
