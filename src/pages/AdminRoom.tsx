import logoImg from '../assets/logo.svg';
import deleteImg from '../assets/delete.svg'
import checkImg from '../assets/check.svg';
import answerImg from '../assets/answer.svg';

import '../styles/room.scss';
import { RoomCode } from '../components/RoomCode';
import { Button } from '../components/Button';
import { useHistory, useParams } from 'react-router-dom';
import { Question } from '../components/Question';
import { useRoom } from '../hooks/useRoom';
import { database } from '../services/firebase';

type RoomParams = {
    id: string;
}

export function AdminRoom() {
    const history = useHistory();
    const params = useParams<RoomParams>();
    const roomID = params.id;

    const { questions, title } = useRoom(roomID);

    async function handleCheckQuestionAsAnswered(questionID: string) {
        await database.ref(`rooms/${roomID}/questions/${questionID}`).update({
            isAnswered: true
        });
    }

    async function handleHighlightQuestion(questionID: string) {
        await database.ref(`rooms/${roomID}/questions/${questionID}`).update({
            isHighlighted: true
        });
    }
    
    async function handleEndRoom() {
        if (window.confirm('Você realmente deseja encerrar essa sala?')) {
            await database.ref(`rooms/${roomID}`).update({
                endedAt: new Date()
            });

            history.push('/');
        }  
    }

    async function handleDeleteQuestion(questionID: string) {
       if (window.confirm('Você realmente deseja excluir essa pergunta?')) {
           await database.ref(`rooms/${roomID}/questions/${questionID}`).remove();
       }
    }
    
    return (
        <div id="page-room">
            <header>
                <div className="content">
                    <img src={logoImg} alt="Letmeask" />
                    <div>
                      <RoomCode code={roomID} />
                      <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
                    </div>
                </div>
            </header>

            <main>
                <div className="room-title">
                    <h1>Sala {title}</h1>
                    {questions.length > 0 && <span>{questions.length} pergunta(s)</span>}
                </div>


                <div className="question-list">
                    {questions.map(question => {
                        return (
                            <Question
                            key={question.id}
                            content={question.content}
                            author={question.author}
                            isAnswered={question.isAnswered}
                            isHighlighted={question.isHighlighted}
                            >
                                {!question.isAnswered && (
                                <>
                                    <button
                                  type="button"
                                  onClick={() => handleCheckQuestionAsAnswered(question.id)}
                                >
                                    <img src={checkImg} alt="Marcar pergunta como respondida" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleHighlightQuestion(question.id)}
                                >
                                    <img src={answerImg} alt="Dar destaque a pergunta" />
                                </button>
                                </>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDeleteQuestion(question.id)}
                                >
                                    <img src={deleteImg} alt="Remover pergunta" />
                                </button>
                                
                            </Question>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}