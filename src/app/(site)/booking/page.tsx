import Image from "next/image";
import type { Metadata } from "next";
import { BookingCueMark } from "@/components/PageMotionMarks";
import { getEvents } from "@/lib/content/repository";
import { pageMetadata } from "@/lib/seo/site";

export const metadata: Metadata = pageMetadata({
  title: "Booking",
  path: "/booking",
  description: "Boek De Kweker voor shows, festivals, clubs, features en pers via info@kwkr.be."
});

const bookingMail = "mailto:info@kwkr.be?subject=Booking%20De%20Kweker&body=Naam%20organisatie%3A%0ADatum%3A%0ALocatie%3A%0AType%20event%3A%0ATiming%3A%0ABudget%3A%0AExtra%20info%3A";

export default async function BookingPage() {
  const bookingImage = (await getEvents()).find((event) => event.slug === "dominus-mma-iv-2025")?.image;
  return (
    <div className="page-shell booking-page">
      <section className="booking-page-hero" data-scroll-scene>
        {bookingImage ? <div className="booking-page-image" data-depth="26"><Image src={bookingImage} alt="De Kweker live op het podium" fill priority sizes="100vw" /></div> : null}
        <div className="booking-page-shade" aria-hidden="true" />
        <BookingCueMark />
        <div className="booking-page-copy" data-reveal>
          <p className="eyebrow eyebrow-accent">Booking / shows / features / pers</p>
          <h1>DE KWEKER<br /><span>OP JOUW EVENT?</span></h1>
          <p>Voor clubshows, festivals, support, features en pers. Mail rechtstreeks naar info@kwkr.be.</p>
          <a className="button" href={bookingMail}>Mail voor booking</a>
        </div>
      </section>
      <section className="booking-mail-guide section">
        <div className="section-heading" data-reveal>
          <div><p className="eyebrow eyebrow-accent">Wat stuur je mee?</p><h2>STUUR DIT<br />MEE.</h2></div>
          <div className="section-heading-aside"><p>Datum, locatie, type event, timing en een korte context. Als er al een budget of technische info is, mag die er meteen bij.</p></div>
        </div>
        <a className="booking-address" href={bookingMail}>info@kwkr.be</a>
      </section>
    </div>
  );
}
