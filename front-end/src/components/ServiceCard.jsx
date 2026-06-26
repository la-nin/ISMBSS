import "./ServiceCard.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function ServiceCard({
  service,
  showBookButton = true,
  showEditButton = false,
}) {
  const imageUrl = service.image_url ? `${API_URL}${service.image_url}` : null;

  return (
    <article className="service-card">
      <div className="service-card-image-wrap">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={service.service_name}
            className="service-card-image"
          />
        ) : (
          <div className="service-card-image">Setup a default image</div>
        )}
      </div>

      <div className="service-card-body">
        <p className="service-card-salon">{service.salon_name}</p>
        <h3>{service.service_name}</h3>

        {service.description && <p>{service.description}</p>}

        <div className="service-card-details">
          <p>Duration: {service.duration_minutes} minutes</p>
          <p>Price: {service.full_price} euros</p>
        </div>

        {showBookButton && (
          <button type="button" className="btn btn-dark w-50">
            Book
          </button>
        )}

        {showEditButton && (
          <button type="button" className="btn btn-dark w-50">
            Edit
          </button>
        )}
      </div>
    </article>
  );
}

export default ServiceCard;
