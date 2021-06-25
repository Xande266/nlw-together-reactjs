import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type FirebaseQuestions = Record<string, {
    author: {
        name: string,
        avatar: string
    },
    content: string,
    isHighlighted: boolean,
    isAnswered: boolean,
    likes: Record<string, {
        authorID: string
    }>
}>;

type QuestionType = {
    id: string;
    author: {
        name: string,
        avatar: string
    },
    content: string,
    isHighlighted: boolean,
    isAnswered: boolean,
    likeCount: number,
    likeID: string | undefined
}

export function useRoom( roomID: string ) {
    const { user } = useAuth();
    const [questions, setQuestions] = useState<QuestionType[]>([]);
    const [title, setTitle] = useState('');

    useEffect(() => {
        const roomRef = database.ref(`rooms/${roomID}`);

        roomRef.on('value', room => {
            const databaseRoom = room.val();
            const firebaseQuestions: FirebaseQuestions = databaseRoom.questions ?? {};

            const parseQuestions = Object.entries(firebaseQuestions).map(([key, value]) => {
                return {
                    id: key,
                    content: value.content,
                    author: value.author,
                    isHighlighted: value.isHighlighted,
                    isAnswered: value.isAnswered,
                    likeCount: Object.values(value.likes ?? {}).length,
                    likeID: Object.entries(value.likes ??{}).find(([key, like]) => like.authorID === user?.id)?.[0]
                };
            });

            setTitle(databaseRoom.title);
            setQuestions(parseQuestions);

            return () => {
                roomRef.off('value');
            }
        });

    }, [roomID, user?.id]);

    return { questions, title };
}