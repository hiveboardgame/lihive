import { getAuth, User as FirebaseUser } from '@firebase/auth';
import app from './db/app';
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState
} from 'react';
import { useRouter } from 'next/router';
import { UserData } from './user/user';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut
} from 'firebase/auth';
import { Game, getGameIsEnded, getGameIsStarted, getUserGames } from './game/game';
import { ensureGuest, ensureUser, getUser, updateUsername } from '..';

export interface PlayerContextProps {
  uid: string | null;
  user: UserData | null;
  incompleteProfile: boolean;
  invitations: Game[];
  activeGames: Game[];
  completedGames: Game[];
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  signout: (redirect: string) => Promise<void>;
}

const auth = getAuth(app);
const playerContext = createContext<PlayerContextProps>(defaultPlayerContext());

const PlayerProvider = ({ children }: { children?: ReactNode }) => {
  const playerState = usePlayerState();
  return (
    <playerContext.Provider value={playerState}>
      {children}
    </playerContext.Provider>
  );
};

const usePlayer = () => {
  return useContext(playerContext);
};

function usePlayerState(): PlayerContextProps {
  const [uid, setUid] = useState<string | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [incompleteProfile, setIncompleteProfile] = useState<boolean>(false);
  const [invitations, setInvitations] = useState<Game[]>([]);
  const [activeGames, setActiveGames] = useState<Game[]>([]);
  const [completedGames, setCompletedGames] = useState<Game[]>([]);
  const router = useRouter();

  /**
   * Handle a change in the user's data.
   */
  const handleFirebaseUser = useCallback(
    (firebaseUser: FirebaseUser | null) => {
      setUid(firebaseUser ? firebaseUser.uid : null);
    },
    []
  );

  /**
   * Handle a change to the player's games
   */
  useEffect(() => {
    if (user === null) return;
    if (user.username === '') {
      setIncompleteProfile(true);
    }
    getUserGames(user)
      .then((games: Game[]) => {
        const activeGames = games.filter(
          (game) => getGameIsStarted(game) && !getGameIsEnded(game)
        );
        const completedGames = games.filter((game) => getGameIsEnded(game));
        const invitations = games.filter((game) => !getGameIsStarted(game));
        setActiveGames(activeGames);
        setCompletedGames(completedGames);
        setInvitations(invitations);
      });
  }, [user]);

  useEffect(() => {
    getUser(uid).then(user => setUser(user));
  }, [uid])

  /**
   * Sign in using Google.
   */
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    return signInWithPopup(auth, provider)
      .then((creds) => creds.user)
      .then(ensureUser)
      .then(user => {
        setUid(user.uid);
        setUser(user);
      });
  };

  const signInAsGuest = () => {
    return signInAnonymously(auth)
      .then((creds) => creds.user)
      .then(ensureGuest)
      .then(user => {
        setUid(user.uid);
        setUser(user);
      });
  }

  /**
   * Sign out the current user and optionally redirect to a page.
   * @param redirect The page to redirect to after sign-out.
   */
  const signout = (redirect?: string) => {
    return signOut(auth)
      .then(() => {
        setUid(null);
        setUser(null);
        setIncompleteProfile(false);
        setActiveGames([]);
        setCompletedGames([]);
        setInvitations([]);
        if (redirect) router.push(redirect);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(handleFirebaseUser);
    return () => {
      unsubscribe();
    };
  }, [handleFirebaseUser]);

  return {
    uid,
    user,
    incompleteProfile,
    activeGames,
    completedGames,
    invitations,
    signInWithGoogle,
    signInAsGuest,
    signout
  };
}

function defaultPlayerContext(): PlayerContextProps {
  const message = 'Player context not properly initialized.';
  return {
    uid: null,
    user: null,
    incompleteProfile: false,
    activeGames: [],
    completedGames: [],
    invitations: [],
    signInWithGoogle: () => Promise.reject(message),
    signInAsGuest: () => Promise.reject(message),
    signout: () => Promise.reject(message)
  };
}

export { PlayerProvider, usePlayer };
