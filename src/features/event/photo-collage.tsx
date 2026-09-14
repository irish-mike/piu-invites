import Image from "next/image";
import type { ReactElement } from "react";
import styles from "./photo-collage.module.css";

type PrintedPhotoProps = Readonly<{
  src: string;
  alt: string;
  width: number;
  height: number;
  sizes: string;
  className: string;
}>;

function PrintedPhoto({ src, alt, width, height, sizes, className }: PrintedPhotoProps): ReactElement {
  return (
    <figure className={`${styles.photo} ${className}`}>
      <div className={styles.imageWindow}>
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          sizes={sizes}
          className={styles.image}
        />
      </div>
    </figure>
  );
}

export function PhotoCollage(): ReactElement {
  return (
    <section aria-label="Scenes from the party" className={styles.section}>
      <div className={styles.composition}>
        <PrintedPhoto
          src="/images/group.webp"
          alt="Three friends in angel, priest and ivy costumes pose together."
          width={5825}
          height={3884}
          sizes="(min-width: 1160px) 627px, (min-width: 960px) calc(58vw - 46px), (min-width: 640px) calc(76vw - 61px), calc(95vw - 38px)"
          className={styles.friends}
        />
        <PrintedPhoto
          src="/images/piu.webp"
          alt="A guest in a white lace costume raises a goblet beneath gauze decorations."
          width={3788}
          height={5682}
          sizes="(min-width: 1160px) 303px, (min-width: 960px) calc(28vw - 22px), (min-width: 640px) calc(35vw - 28px), calc(47vw - 19px)"
          className={styles.goblet}
        />
        <PrintedPhoto
          src="/images/witchdoctor.webp"
          alt="A guest with skull makeup and a tall black hat peers through gauze."
          width={4010}
          height={6016}
          sizes="(min-width: 1160px) 303px, (min-width: 960px) calc(28vw - 22px), (min-width: 640px) calc(43vw - 34px), calc(60vw - 24px)"
          className={styles.topHat}
        />
        <PrintedPhoto
          src="/images/skeloton.webp"
          alt="A guest wears an ornate skull mask and a colourful embroidered jacket."
          width={5879}
          height={3919}
          sizes="(min-width: 1160px) 422px, (min-width: 960px) calc(39vw - 31px), (min-width: 640px) calc(57vw - 46px), calc(85vw - 34px)"
          className={styles.skullMask}
        />
        <PrintedPhoto
          src="/images/dj.webp"
          alt="A DJ plays behind a candlelit table decorated with lights and cobwebs."
          width={3972}
          height={5958}
          sizes="(min-width: 1160px) 281px, (min-width: 960px) calc(26vw - 21px), (min-width: 640px) calc(35vw - 28px), calc(49vw - 20px)"
          className={styles.dj}
        />
        <PrintedPhoto
          src="/images/bike.webp"
          alt="A smiling guest in a cycling helmet carries plates through the party."
          width={4160}
          height={6240}
          sizes="(min-width: 1160px) 270px, (min-width: 960px) calc(25vw - 20px), (min-width: 640px) calc(37vw - 30px), calc(57vw - 23px)"
          className={styles.cyclist}
        />
      </div>
    </section>
  );
}
