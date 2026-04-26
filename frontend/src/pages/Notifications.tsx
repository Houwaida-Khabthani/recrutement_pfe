import {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
} from "../store/api/notificationApi";

const Notifications = () => {
  const { data, isLoading } = useGetNotificationsQuery(undefined);
  const [markAsRead] = useMarkNotificationReadMutation();

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  if (isLoading) return <p>Chargement...</p>;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Notifications</h2>

      {(!data || data.length === 0) && <p>Aucune notification</p>}

      {data?.map((notif: any) => (
        <div
          key={notif.id_notif}
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            padding: "15px",
            marginBottom: "10px",
            backgroundColor: notif.lu ? "#f9f9f9" : "#fff",
            boxShadow: notif.lu ? "none" : "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h4 style={{ margin: "0 0 5px 0" }}>{notif.type}</h4>
          <p style={{ fontSize: "0.85rem", color: "#666" }}>{notif.date}</p>
          <p>{notif.message || "Vous avez une nouvelle mise à jour."}</p>

          {!notif.lu && (
            <button 
              className="btn-primary"
              onClick={() => handleMarkAsRead(notif.id_notif)}
              style={{ marginTop: "10px", cursor: "pointer" }}
            >
              Marquer comme lu
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default Notifications;
