/* Contas de usuário (Firebase): cada pessoa tem o próprio progresso salvo na nuvem.
   Só é usado fora do site do Claude (GitHub Pages / Netlify). */
import { assinatura } from "./progresso.js?v=55";
const CONFIG = {
  apiKey: "AIzaSyD8tSjt-XvZVrD5m4BbQWoMDkYhyCRGGRk",
  authDomain: "studiaworld-43ba4.firebaseapp.com",
  projectId: "studiaworld-43ba4",
  storageBucket: "studiaworld-43ba4.firebasestorage.app",
  messagingSenderId: "487937044883",
  appId: "1:487937044883:web:d1499d536cd248470a3866",
};
const V = "10.13.2";
let fb = null;
const bases = new Map();

export async function iniciaConta(aoMudar) {
  const [appM, authM, fsM] = await Promise.all([
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-auth.js`),
    import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`),
  ]);
  const app = appM.getApps().length ? appM.getApp() : appM.initializeApp(CONFIG);
  const auth = authM.getAuth(app);
  auth.languageCode = "pt";
  const db = fsM.getFirestore(app);
  fb = { authM, fsM, auth, db };
  authM.getRedirectResult(auth).catch(() => {});
  return new Promise((resolve, reject) => {
    authM.onAuthStateChanged(auth, u => {
      Promise.resolve(aoMudar(u ? { uid: u.uid, nome: u.displayName || (u.email || "").split("@")[0], email: u.email, foto: u.photoURL } : null)).then(() => resolve(true), reject);
    }, reject);
  });
}

export async function entraGoogle() {
  const { authM, auth } = fb, p = new authM.GoogleAuthProvider();
  try { await authM.signInWithPopup(auth, p); }
  catch (e) {
    if (["auth/popup-blocked", "auth/operation-not-supported-in-this-environment", "auth/cancelled-popup-request"].includes(e.code)) await authM.signInWithRedirect(auth, p);
    else throw e;
  }
}
export async function entraEmail(email, senha, criar) {
  const { authM, auth } = fb;
  if (criar) return authM.createUserWithEmailAndPassword(auth, email, senha);
  return authM.signInWithEmailAndPassword(auth, email, senha);
}
export async function recuperaSenha(email) { return fb.authM.sendPasswordResetEmail(fb.auth, email); }
export async function sai() { return fb.authM.signOut(fb.auth); }

export async function carrega(uid) {
  const { fsM, db } = fb;
  const s = await fsM.getDoc(fsM.doc(db, "usuarios", uid));
  const estado = s.exists() ? s.data().estado || null : null;
  bases.set(uid, assinatura(estado));
  return estado;
}
export async function salva(uid, estado) {
  const { fsM, db, auth } = fb;
  if (auth.currentUser?.uid !== uid || !bases.has(uid)) throw new Error("Conta ainda não carregada.");
  const base = bases.get(uid), ref = fsM.doc(db, "usuarios", uid);
  await fsM.runTransaction(db, async tx => {
    const snap = await tx.get(ref);
    const remoto = snap.exists() ? snap.data().estado || null : null;
    if (assinatura(remoto) !== base) {
      const erro = new Error("Há progresso mais recente em outro aparelho.");
      erro.code = "progresso/conflito"; throw erro;
    }
    if (auth.currentUser?.uid !== uid) throw new Error("A conta mudou durante o salvamento.");
    tx.set(ref, { estado, atualizado: Date.now() }, { merge: true });
  });
  bases.set(uid, assinatura(estado));
}

export function mensagemErro(e) {
  const c = e?.code || "";
  return ({
    "auth/invalid-email": "E-mail inválido.",
    "auth/missing-password": "Digite a senha.",
    "auth/weak-password": "A senha precisa ter pelo menos 6 caracteres.",
    "auth/email-already-in-use": "Já existe uma conta com esse e-mail. Use \"Entrar\".",
    "auth/invalid-credential": "E-mail ou senha incorretos.",
    "auth/wrong-password": "E-mail ou senha incorretos.",
    "auth/user-not-found": "Não existe conta com esse e-mail. Use \"Criar conta\".",
    "auth/configuration-not-found": "O login ainda não foi ativado no Firebase (Authentication › Método de login).",
    "auth/operation-not-allowed": "Esse tipo de login não está ativado no Firebase.",
    "auth/unauthorized-domain": "Este endereço ainda não foi autorizado no Firebase (Authentication › Settings › Authorized domains).",
    "auth/popup-closed-by-user": "A janela de login foi fechada.",
    "auth/network-request-failed": "Sem conexão com a internet.",
    "auth/too-many-requests": "Muitas tentativas. Espere um pouco e tente de novo.",
  })[c] || `Não foi possível entrar agora. Tente de novo. (${c || e?.message || "erro"})`;
}
